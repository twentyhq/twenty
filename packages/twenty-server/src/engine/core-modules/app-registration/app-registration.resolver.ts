import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { AppRegistrationVariableEntity } from 'src/engine/core-modules/app-registration/app-registration-variable.entity';
import { AppRegistrationEntity } from 'src/engine/core-modules/app-registration/app-registration.entity';
import { AppRegistrationService } from 'src/engine/core-modules/app-registration/app-registration.service';
import { AppRegistrationStatsOutput } from 'src/engine/core-modules/app-registration/dtos/app-registration-stats.output';
import { CreateAppRegistrationInput } from 'src/engine/core-modules/app-registration/dtos/create-app-registration.input';
import { CreateAppRegistrationOutput } from 'src/engine/core-modules/app-registration/dtos/create-app-registration.output';
import { CreateAppRegistrationVariableInput } from 'src/engine/core-modules/app-registration/dtos/create-app-registration-variable.input';
import { RotateClientSecretOutput } from 'src/engine/core-modules/app-registration/dtos/rotate-client-secret.output';
import { UpdateAppRegistrationInput } from 'src/engine/core-modules/app-registration/dtos/update-app-registration.input';
import { UpdateAppRegistrationVariableInput } from 'src/engine/core-modules/app-registration/dtos/update-app-registration-variable.input';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class AppRegistrationResolver {
  constructor(
    private readonly appRegistrationService: AppRegistrationService,
  ) {}

  @Query(() => AppRegistrationEntity, { nullable: true })
  async findAppRegistrationByClientId(
    @Args('clientId') clientId: string,
  ): Promise<AppRegistrationEntity | null> {
    return this.appRegistrationService.findOneByClientId(clientId);
  }

  @UseGuards(WorkspaceAuthGuard)
  @Query(() => AppRegistrationEntity, { nullable: true })
  async findAppRegistrationByUniversalIdentifier(
    @Args('universalIdentifier') universalIdentifier: string,
  ): Promise<AppRegistrationEntity | null> {
    return this.appRegistrationService.findOneByUniversalIdentifier(
      universalIdentifier,
    );
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Query(() => [AppRegistrationEntity])
  async findManyAppRegistrations(): Promise<AppRegistrationEntity[]> {
    return this.appRegistrationService.findMany();
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Query(() => AppRegistrationEntity)
  async findOneAppRegistration(
    @Args('id') id: string,
  ): Promise<AppRegistrationEntity> {
    return this.appRegistrationService.findOneById(id);
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Query(() => AppRegistrationStatsOutput)
  async findAppRegistrationStats(
    @Args('id') id: string,
  ): Promise<AppRegistrationStatsOutput> {
    return this.appRegistrationService.getStats(id);
  }

  @UseGuards(WorkspaceAuthGuard)
  @Mutation(() => CreateAppRegistrationOutput)
  async createAppRegistration(
    @Args('input') input: CreateAppRegistrationInput,
    @AuthUser({ allowUndefined: true }) user: UserEntity | undefined,
  ): Promise<CreateAppRegistrationOutput> {
    return this.appRegistrationService.create(input, user?.id ?? null);
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Mutation(() => AppRegistrationEntity)
  async updateAppRegistration(
    @Args('input') input: UpdateAppRegistrationInput,
  ): Promise<AppRegistrationEntity> {
    return this.appRegistrationService.update(input);
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Mutation(() => Boolean)
  async deleteAppRegistration(
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.appRegistrationService.delete(id);
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Mutation(() => RotateClientSecretOutput)
  async rotateAppRegistrationClientSecret(
    @Args('id') id: string,
  ): Promise<RotateClientSecretOutput> {
    const clientSecret =
      await this.appRegistrationService.rotateClientSecret(id);

    return { clientSecret };
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Query(() => [AppRegistrationVariableEntity])
  async findAppRegistrationVariables(
    @Args('appRegistrationId') appRegistrationId: string,
  ): Promise<AppRegistrationVariableEntity[]> {
    return this.appRegistrationService.findVariables(appRegistrationId);
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Mutation(() => AppRegistrationVariableEntity)
  async createAppRegistrationVariable(
    @Args('input') input: CreateAppRegistrationVariableInput,
  ): Promise<AppRegistrationVariableEntity> {
    return this.appRegistrationService.createVariable(input);
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Mutation(() => AppRegistrationVariableEntity)
  async updateAppRegistrationVariable(
    @Args('input') input: UpdateAppRegistrationVariableInput,
  ): Promise<AppRegistrationVariableEntity> {
    return this.appRegistrationService.updateVariable(input);
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Mutation(() => Boolean)
  async deleteAppRegistrationVariable(
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.appRegistrationService.deleteVariable(id);
  }
}
