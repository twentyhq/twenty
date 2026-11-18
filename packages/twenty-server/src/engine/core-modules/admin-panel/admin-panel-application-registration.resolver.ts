import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  ResolveField,
} from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ClaimApplicationRegistrationOwnershipInput } from 'src/engine/core-modules/application/application-registration/dtos/claim-application-registration-ownership.input';
import { ApplicationRegistrationConfigurationIssue } from 'src/engine/core-modules/application/application-registration/enums/application-registration-configuration-issue.enum';
import { type AdminApplicationRegistrationListItem } from 'src/engine/core-modules/application/application-registration/dtos/paginated-application-registrations.dto';
import { getApplicationAuthorDisplayName } from 'src/engine/core-modules/application/application-registration/utils/get-application-author-display-name.util';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

const ADMIN_APPLICATION_REGISTRATION_CLAIM_ACCESS_POLICY: AccessPolicy = {
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

@AdminResolver(() => ApplicationRegistrationEntity)
export class AdminPanelApplicationRegistrationResolver {
  constructor(
    private readonly applicationRegistrationAssetUrlService: ApplicationRegistrationAssetUrlService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
  ) {}

  @UseGuards(
    AccessPolicyGuard(ADMIN_APPLICATION_REGISTRATION_CLAIM_ACCESS_POLICY),
    AdminPanelGuard,
  )
  @UsePipes(ResolverValidationPipe)
  @UseFilters(
    ApplicationRegistrationExceptionFilter,
    AuthGraphqlApiExceptionFilter,
    PreventNestToAutoLogGraphqlErrorsFilter,
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

  @ResolveField(() => Boolean)
  async isConfigured(
    @Parent()
    registration:
      | ApplicationRegistrationEntity
      | AdminApplicationRegistrationListItem,
    @Context() context: { loaders: IDataloaders },
  ): Promise<boolean> {
    if ('isConfigured' in registration) {
      return registration.isConfigured;
    }

    const configurationIssues =
      await context.loaders.applicationRegistrationConfigurationIssuesLoader.load(
        { applicationRegistrationId: registration.id },
      );

    return configurationIssues.length === 0;
  }

  @ResolveField(() => [ApplicationRegistrationConfigurationIssue])
  async configurationIssues(
    @Parent()
    registration:
      | ApplicationRegistrationEntity
      | AdminApplicationRegistrationListItem,
    @Context() context: { loaders: IDataloaders },
  ): Promise<ApplicationRegistrationConfigurationIssue[]> {
    return context.loaders.applicationRegistrationConfigurationIssuesLoader.load(
      { applicationRegistrationId: registration.id },
    );
  }

  @ResolveField(() => Int)
  async installCount(
    @Parent()
    registration:
      | ApplicationRegistrationEntity
      | AdminApplicationRegistrationListItem,
    @Context() context: { loaders: IDataloaders },
  ): Promise<number> {
    if ('installCount' in registration) {
      return registration.installCount;
    }

    return context.loaders.applicationRegistrationInstallCountLoader.load({
      applicationRegistrationId: registration.id,
    });
  }

  @ResolveField(() => String, { nullable: true })
  author(@Parent() registration: ApplicationRegistrationEntity): string | null {
    return getApplicationAuthorDisplayName(registration.author);
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
