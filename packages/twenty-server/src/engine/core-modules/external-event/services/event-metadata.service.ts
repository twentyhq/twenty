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

  /**
   * Get all event metadata for a workspace
   * @param workspaceId The workspace ID
   * @returns Array of event metadata
   */
  async getWorkspaceEventMetadata(
    workspaceId: string,
  ): Promise<EventMetadata[]> {
    return this.eventMetadataRepository.find({
      where: { workspaceId, isActive: true },
      relations: ['fields'],
    });
  }

  /**
   * Get event metadata by event name for a workspace
   * @param workspaceId The workspace ID
   * @param eventName The event name
   * @returns Event metadata
   */
  async getEventMetadata(
    workspaceId: string,
    eventName: string,
  ): Promise<EventMetadata | null> {
    return this.eventMetadataRepository.findOne({
      where: { workspaceId, name: eventName, isActive: true },
      relations: ['fields'],
    });
  }

  /**
   * Create a new event metadata
   * @param workspaceId The workspace ID
   * @param eventName The event name
   * @param description Optional description
   * @param validObjectTypes Optional list of valid object types
   * @param strictValidation Whether to enforce strict validation
   * @returns The created event metadata
   */
  async createEventMetadata(
    workspaceId: string,
    eventName: string,
    description?: string,
    validObjectTypes?: string[],
    strictValidation = false,
  ): Promise<EventMetadata> {
    const eventMetadata = this.eventMetadataRepository.create({
      name: eventName,
      description,
      validObjectTypes,
      workspaceId,
      strictValidation,
      isActive: true,
    });

    return this.eventMetadataRepository.save(eventMetadata);
  }

  /**
   * Add a field to an event metadata
   * @param eventMetadataId The event metadata ID
   * @param name The field name
   * @param fieldType The field type
   * @param isRequired Whether the field is required
   * @param description Optional description
   * @param allowedValues Optional list of allowed values
   * @returns The created field metadata
   */
  async addEventField(
    eventMetadataId: string,
    name: string,
    fieldType: FieldType,
    isRequired: boolean,
    description?: string,
    allowedValues?: Array<string | number | boolean>,
  ): Promise<EventFieldMetadata> {
    const fieldMetadata = this.eventFieldRepository.create({
      name,
      fieldType,
      isRequired,
      description,
      allowedValues,
      eventMetadataId,
    });

    return this.eventFieldRepository.save(fieldMetadata);
  }

  /**
   * Register validation rules from all event metadata
   * This registers each event metadata as a validation rule with the validator
   */
  async registerValidationRules(): Promise<void> {
    try {
      // Get all active event metadata
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

        // Process each field
        for (const field of metadata.fields || []) {
          if (field.isRequired) {
            schema.required.push(field.name);
          }

          // Map field type
          schema.fieldTypes[field.name] = field.fieldType as
            | 'string'
            | 'number'
            | 'boolean'
            | 'object';

          // Add allowed values if specified
          if (field.allowedValues && field.allowedValues.length > 0) {
            schema.allowedValues[field.name] = field.allowedValues;
          }
        }

        // Register validation rule for this event
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
