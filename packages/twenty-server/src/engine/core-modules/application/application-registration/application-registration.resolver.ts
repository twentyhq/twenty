import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  Args,
  Context,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';

import { type GraphQLResolveInfo } from 'graphql';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { UpdateApplicationRegistrationVariableInput } from 'src/engine/core-modules/application/application-registration-variable/dtos/update-application-registration-variable.input';
import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { isCreditsUsedRequested } from 'src/engine/core-modules/application/application-registration/utils/is-credits-used-requested.util';
import { ApplicationTarballService } from 'src/engine/core-modules/application/application-registration/application-tarball.service';
import { ApplicationRegistrationClaimService } from 'src/engine/core-modules/application/application-registration/application-registration-claim.service';
import { ApplicationRegistrationClaimInput } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-claim.input';
import { ApplicationRegistrationStatsDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-stats.dto';
import { ClaimApplicationRegistrationOwnershipInput } from 'src/engine/core-modules/application/application-registration/dtos/claim-application-registration-ownership.input';
import { ClaimableApplicationRegistrationDTO } from 'src/engine/core-modules/application/application-registration/dtos/claimable-application-registration.dto';
import { FindClaimableApplicationRegistrationInput } from 'src/engine/core-modules/application/application-registration/dtos/find-claimable-application-registration.input';
import { CreateApplicationRegistrationDTO } from 'src/engine/core-modules/application/application-registration/dtos/create-application-registration.dto';
import { CreateApplicationRegistrationInput } from 'src/engine/core-modules/application/application-registration/dtos/create-application-registration.input';
import { PublicApplicationRegistrationDTO } from 'src/engine/core-modules/application/application-registration/dtos/public-application-registration.dto';
import { RotateClientSecretDTO } from 'src/engine/core-modules/application/application-registration/dtos/rotate-client-secret.dto';
import { TransferApplicationRegistrationOwnershipInput } from 'src/engine/core-modules/application/application-registration/dtos/transfer-application-registration-ownership.input';
import { UpdateApplicationRegistrationInput } from 'src/engine/core-modules/application/application-registration/dtos/update-application-registration.input';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { FileUploadGraphqlApiExceptionFilter } from 'src/engine/core-modules/file/file-upload/filters/file-upload-graphql-api-exception.filter';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { StreamSizeExceededError } from 'src/utils/stream-size-exceeded-error';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { ApplicationRegistrationVariableDTO } from 'src/engine/core-modules/application/application-registration-variable/dtos/application-registration-variable.dto';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { ApplicationTargetArgs } from 'src/engine/decorators/auth/application-target-args.decorator';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

const APPLICATION_REGISTRATION_READ_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  },
  requiredPermissionFlags: [PermissionFlagType.API_KEYS_AND_WEBHOOKS],
};

const APPLICATION_REGISTRATION_WRITE_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: false,
  },
  requiredPermissionFlags: [PermissionFlagType.API_KEYS_AND_WEBHOOKS],
};

const APPLICATION_TARBALL_UPLOAD_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: false,
  },
  requiredPermissionFlags: [PermissionFlagType.MARKETPLACE_APPS],
};

const APPLICATION_REGISTRATION_CLAIM_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  },
  requiredPermissionFlags: [PermissionFlagType.APPLICATIONS],
};

const APPLICATION_REGISTRATION_OWNERSHIP_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  },
  requiredPermissionFlags: [PermissionFlagType.APPLICATIONS],
};

@UsePipes(ResolverValidationPipe)
@MetadataResolver(() => ApplicationRegistrationEntity)
@UseFilters(
  ApplicationRegistrationExceptionFilter,
  ApplicationExceptionFilter,
  FileUploadGraphqlApiExceptionFilter,
  AuthGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class ApplicationRegistrationResolver {
  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationLookupService: ApplicationRegistrationLookupService,
    private readonly applicationRegistrationClaimService: ApplicationRegistrationClaimService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
    private readonly applicationTarballService: ApplicationTarballService,
    private readonly applicationRegistrationAssetUrlService: ApplicationRegistrationAssetUrlService,
    private readonly fileUrlService: FileUrlService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @Query(() => PublicApplicationRegistrationDTO, { nullable: true })
  async findApplicationRegistrationByClientId(
    @Args('clientId') clientId: string,
  ): Promise<PublicApplicationRegistrationDTO | null> {
    return this.applicationRegistrationService.findPublicByClientId(clientId);
  }

  @UseGuards(
    AccessPolicyGuard({
      authPrincipals: {
        userSession: {
          standard: true,
          impersonated: true,
          playground: true,
          workspaceAgnostic: false,
        },
        apiKey: true,
        oauthClient: true,
        application: true,
      },
      requiredPermissionFlags: [],
    }),
    ApplicationTargetGuard,
  )
  @Query(() => ApplicationRegistrationEntity, { nullable: true })
  async findApplicationRegistrationByUniversalIdentifier(
    @ApplicationTargetArg('universalIdentifier', {
      kind: 'applicationUniversalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    universalIdentifier: string,
  ): Promise<ApplicationRegistrationEntity | null> {
    return this.applicationRegistrationLookupService.findOneByUniversalIdentifierGlobal(
      universalIdentifier,
    );
  }

  @UseGuards(AccessPolicyGuard(APPLICATION_REGISTRATION_READ_ACCESS_POLICY))
  @Query(() => [ApplicationRegistrationEntity])
  async findManyApplicationRegistrations(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<ApplicationRegistrationEntity[]> {
    const registrations =
      await this.applicationRegistrationService.findMany(workspaceId);

    const scopedCallingApplication =
      getScopedCallingApplication(callingApplication);

    if (!isDefined(scopedCallingApplication)) {
      return registrations;
    }

    return registrations.filter(
      (registration) =>
        registration.id === scopedCallingApplication.applicationRegistrationId,
    );
  }

  @UseGuards(
    AccessPolicyGuard(APPLICATION_REGISTRATION_READ_ACCESS_POLICY),
    ApplicationTargetGuard,
  )
  @Query(() => ApplicationRegistrationEntity)
  async findOneApplicationRegistration(
    @ApplicationTargetArg('id', {
      kind: 'applicationRegistrationId',
      requireApplicationRegistrationOwnership: true,
    })
    applicationRegistrationId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationRegistrationEntity> {
    return this.applicationRegistrationLookupService.findOneByIdOrThrow({
      applicationRegistrationId,
      ownerWorkspaceId: workspaceId,
    });
  }

  @UseGuards(
    AccessPolicyGuard(APPLICATION_REGISTRATION_READ_ACCESS_POLICY),
    ApplicationTargetGuard,
  )
  @Query(() => ApplicationRegistrationStatsDTO)
  async findApplicationRegistrationStats(
    @ApplicationTargetArg('id', {
      kind: 'applicationRegistrationId',
      requireApplicationRegistrationOwnership: true,
    })
    applicationRegistrationId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Info() info: GraphQLResolveInfo,
    @Args('periodStart', { type: () => Date, nullable: true })
    periodStart?: Date,
    @Args('periodEnd', { type: () => Date, nullable: true })
    periodEnd?: Date,
  ): Promise<ApplicationRegistrationStatsDTO> {
    return this.applicationRegistrationService.getStats({
      applicationRegistrationId,
      ownerWorkspaceId: workspaceId,
      periodStart,
      periodEnd,
      includeCreditsUsed: isCreditsUsedRequested(info),
    });
  }

  @UseGuards(AccessPolicyGuard(APPLICATION_REGISTRATION_WRITE_ACCESS_POLICY))
  @Mutation(() => CreateApplicationRegistrationDTO)
  async createApplicationRegistration(
    @Args('input') input: CreateApplicationRegistrationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUser({ allowUndefined: true }) user: UserEntity | undefined,
  ): Promise<CreateApplicationRegistrationDTO> {
    return this.applicationRegistrationService.createWithClientSecret({
      input,
      ownerWorkspaceId: workspaceId,
      createdByUserId: user?.id ?? null,
    });
  }

  @UseGuards(
    AccessPolicyGuard(APPLICATION_REGISTRATION_WRITE_ACCESS_POLICY),
    ApplicationTargetGuard,
  )
  @Mutation(() => ApplicationRegistrationEntity)
  async updateApplicationRegistration(
    @ApplicationTargetArg<UpdateApplicationRegistrationInput>('input', {
      kind: 'applicationRegistrationId',
      idKey: 'id',
      requireApplicationRegistrationOwnership: true,
    })
    input: UpdateApplicationRegistrationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationRegistrationEntity> {
    return this.applicationRegistrationService.update(input, workspaceId);
  }

  @UseGuards(
    AccessPolicyGuard(APPLICATION_REGISTRATION_WRITE_ACCESS_POLICY),
    ApplicationTargetGuard,
  )
  @Mutation(() => Boolean)
  async deleteApplicationRegistration(
    @ApplicationTargetArg('id', {
      kind: 'applicationRegistrationId',
      requireApplicationRegistrationOwnership: true,
    })
    applicationRegistrationId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    return this.applicationRegistrationService.delete({
      applicationRegistrationId,
      ownerWorkspaceId: workspaceId,
    });
  }

  @UseGuards(
    AccessPolicyGuard({
      authPrincipals: {
        userSession: {
          standard: true,
          impersonated: true,
          playground: true,
          workspaceAgnostic: false,
        },
        apiKey: true,
        oauthClient: true,
        application: false,
      },
      requiredPermissionFlags: [
        PermissionFlagType.API_KEYS_AND_WEBHOOKS,
        PermissionFlagType.ROLES,
      ],
    }),
    ApplicationTargetGuard,
  )
  @Mutation(() => RotateClientSecretDTO)
  async rotateApplicationRegistrationClientSecret(
    @ApplicationTargetArg('id', {
      kind: 'applicationRegistrationId',
      requireApplicationRegistrationOwnership: true,
    })
    applicationRegistrationId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<RotateClientSecretDTO> {
    const clientSecret =
      await this.applicationRegistrationService.rotateClientSecret({
        applicationRegistrationId,
        ownerWorkspaceId: workspaceId,
      });

    return { clientSecret };
  }

  @UseGuards(
    AccessPolicyGuard(APPLICATION_REGISTRATION_READ_ACCESS_POLICY),
    ApplicationTargetGuard,
  )
  @Query(() => [ApplicationRegistrationVariableDTO])
  async findApplicationRegistrationVariables(
    @ApplicationTargetArg('applicationRegistrationId', {
      kind: 'applicationRegistrationId',
      requireApplicationRegistrationOwnership: true,
    })
    applicationRegistrationId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationRegistrationVariableDTO[]> {
    return this.applicationRegistrationVariableService.findVariablesWithObfuscatedValues(
      { applicationRegistrationId, workspaceId },
    );
  }

  @UseGuards(AccessPolicyGuard(APPLICATION_REGISTRATION_WRITE_ACCESS_POLICY))
  @Mutation(() => ApplicationRegistrationVariableDTO)
  async updateApplicationRegistrationVariable(
    @Args('input') input: UpdateApplicationRegistrationVariableInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<ApplicationRegistrationVariableDTO> {
    return this.applicationRegistrationVariableService.updateVariable({
      input,
      workspaceId,
      callingApplication,
    });
  }

  @UseGuards(AccessPolicyGuard(APPLICATION_TARBALL_UPLOAD_ACCESS_POLICY))
  @Mutation(() => ApplicationRegistrationEntity)
  async completeAppTarballUpload(
    @Args({ name: 'fileId', type: () => UUIDScalarType }) fileId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationRegistrationEntity> {
    return this.applicationTarballService.completeTarballUpload({
      ownerWorkspaceId: workspaceId,
      fileId,
    });
  }

  @UseGuards(AccessPolicyGuard(APPLICATION_TARBALL_UPLOAD_ACCESS_POLICY))
  @Mutation(() => ApplicationRegistrationEntity, {
    deprecationReason:
      'Use createFileUpload with the AppTarball folder and completeAppTarballUpload, which send the tarball straight to file storage.',
  })
  async uploadAppTarball(
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream }: FileUpload,
    @Args('universalIdentifier', {
      type: () => String,
      nullable: true,
      deprecationReason:
        'Ignored: the application universalIdentifier is read from the tarball manifest.',
    })
    _universalIdentifier: string | undefined,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationRegistrationEntity> {
    const maxSize = this.twentyConfigService.get(
      'MAX_TARBALL_UPLOAD_SIZE_BYTES',
    );

    const stream = createReadStream();

    try {
      const tarballBuffer = await streamToBuffer(stream, maxSize);

      return this.applicationTarballService.uploadTarball({
        tarballBuffer,
        ownerWorkspaceId: workspaceId,
      });
    } catch (error) {
      if (error instanceof StreamSizeExceededError) {
        throw new ApplicationRegistrationException(
          `Tarball exceeds maximum size of ${maxSize} bytes`,
          ApplicationRegistrationExceptionCode.INVALID_INPUT,
        );
      }
      throw error;
    }
  }

  @UseGuards(
    AccessPolicyGuard(APPLICATION_REGISTRATION_READ_ACCESS_POLICY),
    ApplicationTargetGuard,
  )
  @Query(() => String, { nullable: true })
  async applicationRegistrationTarballUrl(
    @ApplicationTargetArg('id', {
      kind: 'applicationRegistrationId',
      requireApplicationRegistrationOwnership: true,
    })
    applicationRegistrationId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<string | null> {
    const registration =
      await this.applicationRegistrationLookupService.findOneByIdOrThrow({
        applicationRegistrationId,
        ownerWorkspaceId: workspaceId,
      });

    if (
      registration.sourceType !== ApplicationRegistrationSourceType.TARBALL ||
      !isDefined(registration.tarballFileId)
    ) {
      return null;
    }

    return await this.fileUrlService.signFileByIdUrl({
      fileId: registration.tarballFileId,
      workspaceId,
      fileFolder: FileFolder.AppTarball,
    });
  }

  @UseGuards(AccessPolicyGuard(APPLICATION_REGISTRATION_CLAIM_ACCESS_POLICY))
  @Query(() => ClaimableApplicationRegistrationDTO, { nullable: true })
  async findClaimableApplicationRegistration(
    @Args()
    {
      sourcePackage,
      universalIdentifier,
    }: FindClaimableApplicationRegistrationInput,
  ): Promise<ClaimableApplicationRegistrationDTO | null> {
    return this.applicationRegistrationService.findClaimable({
      sourcePackage,
      universalIdentifier,
    });
  }

  @UseGuards(
    AccessPolicyGuard(APPLICATION_REGISTRATION_OWNERSHIP_ACCESS_POLICY),
    AdminPanelGuard,
  )
  @Mutation(() => ApplicationRegistrationEntity)
  async claimApplicationRegistrationOwnership(
    @Args()
    { applicationRegistrationId }: ClaimApplicationRegistrationOwnershipInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationRegistrationEntity> {
    return this.applicationRegistrationService.claimOwnership({
      applicationRegistrationId,
      claimingWorkspaceId: workspaceId,
    });
  }

  @UseGuards(
    AccessPolicyGuard(APPLICATION_REGISTRATION_CLAIM_ACCESS_POLICY),
    ApplicationTargetGuard,
  )
  @Query(() => String)
  async githubClaimAuthorizationUrl(
    @ApplicationTargetArgs<ApplicationRegistrationClaimInput>({
      kind: 'applicationRegistrationId',
      idKey: 'applicationRegistrationId',
      requireApplicationRegistrationOwnership: false,
    })
    { applicationRegistrationId }: ApplicationRegistrationClaimInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUser({ allowUndefined: true }) user: UserEntity | undefined,
  ): Promise<string> {
    return this.applicationRegistrationClaimService.buildGithubAuthorizationUrl(
      {
        applicationRegistrationId,
        workspaceId,
        userId: user?.id ?? null,
      },
    );
  }

  @UseGuards(
    AccessPolicyGuard(APPLICATION_REGISTRATION_OWNERSHIP_ACCESS_POLICY),
    ApplicationTargetGuard,
  )
  @Mutation(() => ApplicationRegistrationEntity)
  async transferApplicationRegistrationOwnership(
    @ApplicationTargetArgs<TransferApplicationRegistrationOwnershipInput>({
      kind: 'applicationRegistrationId',
      idKey: 'applicationRegistrationId',
      requireApplicationRegistrationOwnership: true,
    })
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
    const configurationIssues =
      await context.loaders.applicationRegistrationConfigurationIssuesLoader.load(
        { applicationRegistrationId: registration.id },
      );

    return configurationIssues.length === 0;
  }

  @ResolveField(() => String, { nullable: true })
  logoUrl(
    @Parent() registration: ApplicationRegistrationEntity,
  ): string | null {
    return this.applicationRegistrationAssetUrlService.buildLogoUrl(
      registration,
    );
  }

  @ResolveField(() => [String])
  galleryImagesUrls(
    @Parent() registration: ApplicationRegistrationEntity,
  ): string[] {
    return this.applicationRegistrationAssetUrlService.buildGalleryImageUrls(
      registration,
    );
  }
}
