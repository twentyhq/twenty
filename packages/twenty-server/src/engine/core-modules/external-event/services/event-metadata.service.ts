import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
    EventFieldMetadata,
    FieldType,
} from 'src/engine/core-modules/external-event/entities/event-field-metadata.entity';
import { EventMetadata } from 'src/engine/core-modules/external-event/entities/event-metadata.entity';
import { ExternalEventValidator } from 'src/engine/core-modules/external-event/validators/external-event.validator';
import { EventMetadataValidationRule } from 'src/engine/core-modules/external-event/validators/schema-validation.rule';

/**
 * Service for managing event metadata and field definitions
 */
@Injectable()
export class EventMetadataService {
  private readonly logger = new Logger(EventMetadataService.name);

  constructor(
    @InjectRepository(EventMetadata, 'core')
    private readonly eventMetadataRepository: Repository<EventMetadata>,
    @InjectRepository(EventFieldMetadata, 'core')
    private readonly eventFieldRepository: Repository<EventFieldMetadata>,
    private readonly externalEventValidator: ExternalEventValidator,
  ) {}

  async getWorkspaceEventMetadata(
    workspaceId: string,
  ): Promise<EventMetadata[]> {
    return this.eventMetadataRepository.find({
      where: { workspaceId, isActive: true },
      relations: ['fields'],
    });
  }

  async getEventMetadata(
    workspaceId: string,
    eventName: string,
  ): Promise<EventMetadata | null> {
    return this.eventMetadataRepository.findOne({
      where: { workspaceId, name: eventName, isActive: true },
      relations: ['fields'],
    });
  }

  async findOrCreateEventMetadata(
    workspaceId: string,
    eventName: string,
    properties: Record<string, any>,
  ): Promise<EventMetadata> {
    let eventMetadata = await this.eventMetadataRepository.findOne({
      where: { workspaceId, name: eventName },
      relations: ['fields'],
    });

    if (!eventMetadata) {
      this.logger.log(`Creating new event metadata for ${eventName}`);
      eventMetadata = this.eventMetadataRepository.create({
        name: eventName,
        workspaceId,
        isActive: true,
      });
      eventMetadata = await this.eventMetadataRepository.save(eventMetadata);
    }

    await this.processEventProperties(eventMetadata.id, properties);

    const updatedMetadata = await this.eventMetadataRepository.findOne({
      where: { id: eventMetadata.id },
      relations: ['fields'],
    });

    if (!updatedMetadata) {
      throw new Error(`Failed to reload event metadata for ${eventName}`);
    }

    return updatedMetadata;
  }

  private async processEventProperties(
    eventMetadataId: string,
    properties: Record<string, any>,
  ): Promise<void> {
    const existingFields = await this.eventFieldRepository.find({
      where: { eventMetadataId },
    });

    for (const [key, value] of Object.entries(properties)) {
      if (value === null || value === undefined) {
        continue;
      }

      const existingField = existingFields.find((field) => field.name === key);
      const fieldType = this.inferFieldType(value);

      if (existingField) {
        if (existingField.fieldType !== fieldType) {
          this.logger.log(
            `Updating field type for ${key} from ${existingField.fieldType} to ${fieldType}`,
          );
          existingField.fieldType = fieldType;
          await this.eventFieldRepository.save(existingField);
        }
      } else {
        this.logger.log(`Creating new field ${key} with type ${fieldType}`);
        await this.eventFieldRepository.save(
          this.eventFieldRepository.create({
            name: key,
            fieldType,
            isRequired: false,
            eventMetadataId,
            isActive: true,
          }),
        );
      }
    }
  }

  private inferFieldType(value: any): FieldType {
    const type = typeof value;

    if (type === 'string') return FieldType.STRING;
    if (type === 'number') return FieldType.NUMBER;
    if (type === 'boolean') return FieldType.BOOLEAN;
    if (type === 'object') {
      if (Array.isArray(value)) {
        return FieldType.OBJECT;
      }

      return FieldType.OBJECT;
    }

    return FieldType.STRING;
  }

  /**
   * Register validation rules from all event metadata
   * This registers each event metadata as a validation rule with the validator
   */
  async registerValidationRules(): Promise<void> {
    try {
      const allEventMetadata = await this.eventMetadataRepository.find({
        where: { isActive: true },
        relations: ['fields'],
      });

      // Register validation rules for each event type
      for (const metadata of allEventMetadata) {
        // Create schema definition from the fields
        const schema = {
          validObjectTypes: metadata.validObjectTypes,
          strictValidation: metadata.strictValidation,
          required: [] as Array<string>,
          fieldTypes: {} as Record<
            string,
            'string' | 'number' | 'boolean' | 'object'
          >,
          allowedValues: {} as Record<string, Array<string | number | boolean>>,
        };

        // Process active fields only
        for (const field of metadata.fields || []) {
          if (!field.isActive) {
            continue;
          }

          if (field.isRequired) {
            schema.required.push(field.name);
          }

          schema.fieldTypes[field.name] = field.fieldType as
            | 'string'
            | 'number'
            | 'boolean'
            | 'object';

          if (field.allowedValues && field.allowedValues.length > 0) {
            schema.allowedValues[field.name] = field.allowedValues;
          }
        }

        this.externalEventValidator.registerEventRule(
          metadata.name,
          new EventMetadataValidationRule(schema),
        );
      }
    } catch (error) {
      // During startup, the tables might not exist yet
      this.logger.warn(`Could not load event metadata: ${error.message}`);
    }
  }

  /**
   * Load all event metadata and register validation rules
   * This should be called on application startup
   */
  async loadAllEventMetadata(): Promise<void> {
    await this.registerValidationRules();
  }
}
