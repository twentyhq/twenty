import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import {
  ExternalEventException,
  ExternalEventExceptionCode,
} from './external-event.exception';

import { EventFieldMetadataOutput } from './dto/outputs/event-field-metadata.output';
import { EventMetadataOutput } from './dto/outputs/event-metadata.output';
import { EventFieldMetadata } from './entities/event-field-metadata.entity';
import { EventMetadata } from './entities/event-metadata.entity';
import { EventMetadataService } from './services/event-metadata.service';

@Resolver(() => EventMetadataOutput)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class EventMetadataResolver {
  constructor(
    private readonly eventMetadataService: EventMetadataService,
    @InjectRepository(FeatureFlag, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlag>,
    @InjectRepository(EventFieldMetadata, 'core')
    private readonly eventFieldRepository: Repository<EventFieldMetadata>,
    @InjectRepository(EventMetadata, 'core')
    private readonly eventMetadataRepository: Repository<EventMetadata>,
  ) {}

  private async checkFeatureEnabled(workspaceId: string): Promise<void> {
    const isFeatureEnabled = await this.featureFlagRepository.findOne({
      where: {
        workspaceId,
        key: FeatureFlagKey.IsExternalEventEnabled,
        value: true,
      },
    });

    if (!isFeatureEnabled) {
      throw new ExternalEventException(
        'External Event feature is not enabled for this workspace',
        ExternalEventExceptionCode.FEATURE_DISABLED,
      );
    }
  }

  @Query(() => [EventMetadataOutput])
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async eventMetadataList(
    @AuthWorkspace() workspace: Workspace,
  ): Promise<EventMetadata[]> {
    await this.checkFeatureEnabled(workspace.id);

    return this.eventMetadataService.getWorkspaceEventMetadata(workspace.id);
  }

  @Query(() => EventMetadataOutput, { nullable: true })
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async eventMetadata(
    @AuthWorkspace() workspace: Workspace,
    @Args('eventName') eventName: string,
  ): Promise<EventMetadata | null> {
    await this.checkFeatureEnabled(workspace.id);

    return this.eventMetadataService.getEventMetadata(workspace.id, eventName);
  }

  @Mutation(() => EventMetadataOutput)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async setEventMetadataActive(
    @AuthWorkspace() workspace: Workspace,
    @Args('eventMetadataId', { type: () => ID }) eventMetadataId: string,
    @Args('isActive') isActive: boolean,
  ): Promise<EventMetadata> {
    await this.checkFeatureEnabled(workspace.id);

    const eventMetadata = await this.eventMetadataRepository.findOne({
      where: { id: eventMetadataId, workspaceId: workspace.id },
      relations: ['fields'],
    });

    if (!eventMetadata) {
      throw new ExternalEventException(
        'Event metadata not found',
        ExternalEventExceptionCode.INVALID_INPUT,
      );
    }

    eventMetadata.isActive = isActive;
    const savedMetadata =
      await this.eventMetadataRepository.save(eventMetadata);

    await this.eventMetadataService.registerValidationRules();

    return savedMetadata;
  }

  @Mutation(() => EventFieldMetadataOutput)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async setEventFieldActive(
    @AuthWorkspace() workspace: Workspace,
    @Args('fieldId', { type: () => ID }) fieldId: string,
    @Args('isActive') isActive: boolean,
  ): Promise<EventFieldMetadata> {
    await this.checkFeatureEnabled(workspace.id);

    const field = await this.eventFieldRepository.findOne({
      where: { id: fieldId },
      relations: ['eventMetadata'],
    });

    if (!field || field.eventMetadata.workspaceId !== workspace.id) {
      throw new ExternalEventException(
        'Field not found or does not belong to this workspace',
        ExternalEventExceptionCode.INVALID_INPUT,
      );
    }

    field.isActive = isActive;
    const savedField = await this.eventFieldRepository.save(field);

    await this.eventMetadataService.registerValidationRules();

    return savedField;
  }

  @Mutation(() => EventFieldMetadataOutput)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async setEventFieldRequired(
    @AuthWorkspace() workspace: Workspace,
    @Args('fieldId', { type: () => ID }) fieldId: string,
    @Args('isRequired') isRequired: boolean,
  ): Promise<EventFieldMetadata> {
    await this.checkFeatureEnabled(workspace.id);

    const field = await this.eventFieldRepository.findOne({
      where: { id: fieldId },
      relations: ['eventMetadata'],
    });

    if (!field || field.eventMetadata.workspaceId !== workspace.id) {
      throw new ExternalEventException(
        'Field not found or does not belong to this workspace',
        ExternalEventExceptionCode.INVALID_INPUT,
      );
    }

    field.isRequired = isRequired;
    const savedField = await this.eventFieldRepository.save(field);

    await this.eventMetadataService.registerValidationRules();

    return savedField;
  }

  @Mutation(() => EventMetadataOutput)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async setEventStrictValidation(
    @AuthWorkspace() workspace: Workspace,
    @Args('eventMetadataId', { type: () => ID }) eventMetadataId: string,
    @Args('strictValidation') strictValidation: boolean,
  ): Promise<EventMetadata> {
    await this.checkFeatureEnabled(workspace.id);

    const eventMetadata = await this.eventMetadataRepository.findOne({
      where: { id: eventMetadataId, workspaceId: workspace.id },
      relations: ['fields'],
    });

    if (!eventMetadata) {
      throw new ExternalEventException(
        'Event metadata not found',
        ExternalEventExceptionCode.INVALID_INPUT,
      );
    }

    eventMetadata.strictValidation = strictValidation;
    const savedMetadata =
      await this.eventMetadataRepository.save(eventMetadata);

    await this.eventMetadataService.registerValidationRules();

    return savedMetadata;
  }
}
