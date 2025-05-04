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

import { CreateEventFieldMetadataInput } from './dto/inputs/create-event-field-metadata.input';
import { CreateEventMetadataInput } from './dto/inputs/create-event-metadata.input';
import { EventFieldMetadataOutput } from './dto/outputs/event-field-metadata.output';
import { EventMetadataOutput } from './dto/outputs/event-metadata.output';
import {
  EventFieldMetadata,
  FieldType,
} from './entities/event-field-metadata.entity';
import { EventMetadata } from './entities/event-metadata.entity';
import { EventMetadataService } from './services/event-metadata.service';

@Resolver(() => EventMetadataOutput)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class EventMetadataResolver {
  constructor(
    private readonly eventMetadataService: EventMetadataService,
    @InjectRepository(FeatureFlag, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlag>,
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
  async createEventMetadata(
    @AuthWorkspace() workspace: Workspace,
    @Args('input') input: CreateEventMetadataInput,
  ): Promise<EventMetadata> {
    await this.checkFeatureEnabled(workspace.id);

    return this.eventMetadataService.createEventMetadata(
      workspace.id,
      input.name,
      input.description,
      input.validObjectTypes,
      input.strictValidation,
    );
  }

  @Mutation(() => EventFieldMetadataOutput)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async addEventField(
    @AuthWorkspace() workspace: Workspace,
    @Args('eventMetadataId', { type: () => ID }) eventMetadataId: string,
    @Args('input') input: CreateEventFieldMetadataInput,
  ): Promise<EventFieldMetadata> {
    await this.checkFeatureEnabled(workspace.id);

    return this.eventMetadataService.addEventField(
      eventMetadataId,
      input.name,
      input.fieldType as FieldType,
      input.isRequired,
      input.description,
      input.allowedValues,
    );
  }
}
