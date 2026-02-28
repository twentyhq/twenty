import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application-registration/application-registration-variable.entity';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application-registration/application-registration-variable.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application-registration/application-registration.service';
import { ApplicationRegistrationStatsDTO } from 'src/engine/core-modules/application-registration/dtos/application-registration-stats.dto';
import { CreateApplicationRegistrationInput } from 'src/engine/core-modules/application-registration/dtos/create-application-registration.input';
import { CreateApplicationRegistrationDTO } from 'src/engine/core-modules/application-registration/dtos/create-application-registration.dto';
import { PublicApplicationRegistrationDTO } from 'src/engine/core-modules/application-registration/dtos/public-application-registration.dto';
import { CreateApplicationRegistrationVariableInput } from 'src/engine/core-modules/application-registration/dtos/create-application-registration-variable.input';
import { RotateClientSecretDTO } from 'src/engine/core-modules/application-registration/dtos/rotate-client-secret.dto';
import { UpdateApplicationRegistrationInput } from 'src/engine/core-modules/application-registration/dtos/update-application-registration.input';
import { UpdateApplicationRegistrationVariableInput } from 'src/engine/core-modules/application-registration/dtos/update-application-registration-variable.input';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class ApplicationRegistrationResolver {
  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
  ) {}

  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @Query(() => PublicApplicationRegistrationDTO, { nullable: true })
  async findApplicationRegistrationByClientId(
    @Args('clientId') clientId: string,
  ): Promise<PublicApplicationRegistrationDTO | null> {
    return this.applicationRegistrationService.findPublicByClientId(clientId);
  }

  @UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
  @Query(() => ApplicationRegistrationEntity, { nullable: true })
  async findApplicationRegistrationByUniversalIdentifier(
    @Args('universalIdentifier') universalIdentifier: string,
  ): Promise<ApplicationRegistrationEntity | null> {
    return this.applicationRegistrationService.findOneByUniversalIdentifier(
      universalIdentifier,
    );
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Query(() => [ApplicationRegistrationEntity])
  async findManyApplicationRegistrations(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationRegistrationEntity[]> {
    return this.applicationRegistrationService.findMany(workspaceId);
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Query(() => ApplicationRegistrationEntity)
  async findOneApplicationRegistration(
    @Args('id') id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationRegistrationEntity> {
    return this.applicationRegistrationService.findOneById(id, workspaceId);
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Query(() => ApplicationRegistrationStatsDTO)
  async findApplicationRegistrationStats(
    @Args('id') id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationRegistrationStatsDTO> {
    return this.applicationRegistrationService.getStats(id, workspaceId);
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Mutation(() => CreateApplicationRegistrationDTO)
  async createApplicationRegistration(
    @Args('input') input: CreateApplicationRegistrationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUser({ allowUndefined: true }) user: UserEntity | undefined,
  ): Promise<CreateApplicationRegistrationDTO> {
    return this.applicationRegistrationService.create(
      input,
      workspaceId,
      user?.id ?? null,
    );
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Mutation(() => ApplicationRegistrationEntity)
  async updateApplicationRegistration(
    @Args('input') input: UpdateApplicationRegistrationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationRegistrationEntity> {
    return this.applicationRegistrationService.update(input, workspaceId);
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Mutation(() => Boolean)
  async deleteApplicationRegistration(
    @Args('id') id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    return this.applicationRegistrationService.delete(id, workspaceId);
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Mutation(() => RotateClientSecretDTO)
  async rotateApplicationRegistrationClientSecret(
    @Args('id') id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<RotateClientSecretDTO> {
    const clientSecret =
      await this.applicationRegistrationService.rotateClientSecret(
        id,
        workspaceId,
      );

    return { clientSecret };
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Query(() => [ApplicationRegistrationVariableEntity])
  async findApplicationRegistrationVariables(
    @Args('applicationRegistrationId') applicationRegistrationId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationRegistrationVariableEntity[]> {
    return this.applicationRegistrationVariableService.findVariables(
      applicationRegistrationId,
      workspaceId,
    );
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Mutation(() => ApplicationRegistrationVariableEntity)
  async createApplicationRegistrationVariable(
    @Args('input') input: CreateApplicationRegistrationVariableInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationRegistrationVariableEntity> {
    return this.applicationRegistrationVariableService.createVariable(
      input,
      workspaceId,
    );
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Mutation(() => ApplicationRegistrationVariableEntity)
  async updateApplicationRegistrationVariable(
    @Args('input') input: UpdateApplicationRegistrationVariableInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationRegistrationVariableEntity> {
    return this.applicationRegistrationVariableService.updateVariable(
      input,
      workspaceId,
    );
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Mutation(() => Boolean)
  async deleteApplicationRegistrationVariable(
    @Args('id') id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    return this.applicationRegistrationVariableService.deleteVariable(
      id,
      workspaceId,
    );
  }
}
