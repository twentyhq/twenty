import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';

import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { CreateApplicationRegistrationVariableInput } from 'src/engine/core-modules/application/application-registration-variable/dtos/create-application-registration-variable.input';
import { UpdateApplicationRegistrationVariableInput } from 'src/engine/core-modules/application/application-registration-variable/dtos/update-application-registration-variable.input';
import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import {
  ApplicationTarballService,
  MAX_TARBALL_UPLOAD_SIZE_BYTES,
} from 'src/engine/core-modules/application/application-registration/application-tarball.service';
import { ApplicationRegistrationStatsDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-stats.dto';
import { CreateApplicationRegistrationDTO } from 'src/engine/core-modules/application/application-registration/dtos/create-application-registration.dto';
import { CreateApplicationRegistrationInput } from 'src/engine/core-modules/application/application-registration/dtos/create-application-registration.input';
import { PublicApplicationRegistrationDTO } from 'src/engine/core-modules/application/application-registration/dtos/public-application-registration.dto';
import { RotateClientSecretDTO } from 'src/engine/core-modules/application/application-registration/dtos/rotate-client-secret.dto';
import { TransferApplicationRegistrationOwnershipInput } from 'src/engine/core-modules/application/application-registration/dtos/transfer-application-registration-ownership.input';
import { UpdateApplicationRegistrationInput } from 'src/engine/core-modules/application/application-registration/dtos/update-application-registration.input';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@UsePipes(ResolverValidationPipe)
@MetadataResolver(() => ApplicationRegistrationEntity)
@UseFilters(
  ApplicationRegistrationExceptionFilter,
  AuthGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class ApplicationRegistrationResolver {
  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
    private readonly applicationTarballService: ApplicationTarballService,
    private readonly fileUrlService: FileUrlService,
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

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.MARKETPLACE_APPS),
  )
  @Mutation(() => ApplicationRegistrationEntity)
  async uploadAppTarball(
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream }: FileUpload,
    @Args('universalIdentifier', { type: () => String, nullable: true })
    universalIdentifier: string | undefined,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationRegistrationEntity> {
    const stream = createReadStream();
    const tarballBuffer = await streamToBuffer(stream);

    if (tarballBuffer.length > MAX_TARBALL_UPLOAD_SIZE_BYTES) {
      throw new ApplicationRegistrationException(
        `Tarball exceeds maximum size of ${MAX_TARBALL_UPLOAD_SIZE_BYTES} bytes`,
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    return this.applicationTarballService.uploadTarball({
      tarballBuffer,
      universalIdentifier,
      ownerWorkspaceId: workspaceId,
    });
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Query(() => String, { nullable: true })
  async applicationRegistrationTarballUrl(
    @Args('id') id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<string | null> {
    const registration = await this.applicationRegistrationService.findOneById(
      id,
      workspaceId,
    );

    if (
      registration.sourceType !== ApplicationRegistrationSourceType.TARBALL ||
      !isDefined(registration.tarballFileId)
    ) {
      return null;
    }

    return this.fileUrlService.signFileByIdUrl({
      fileId: registration.tarballFileId,
      workspaceId,
      fileFolder: FileFolder.AppTarball,
    });
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
  )
  @Mutation(() => ApplicationRegistrationEntity)
  async transferApplicationRegistrationOwnership(
    @Args()
    {
      applicationRegistrationId,
      targetWorkspaceSubdomain,
    }: TransferApplicationRegistrationOwnershipInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationRegistrationEntity> {
    return this.applicationRegistrationService.transferOwnership({
      applicationRegistrationId,
      targetWorkspaceSubdomain,
      currentOwnerWorkspaceId: workspaceId,
    });
  }

  @ResolveField(() => Boolean)
  async isConfigured(
    @Parent() registration: ApplicationRegistrationEntity,
    @Context() context: { loaders: IDataloaders },
  ): Promise<boolean> {
    return context.loaders.isConfiguredLoader.load({
      applicationRegistrationId: registration.id,
    });
  }
}
