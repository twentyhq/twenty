import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationSuggestedViewFieldService } from 'src/engine/core-modules/application/application-install/application-suggested-view-field.service';
import { ApplicationSuggestedViewFieldDTO } from 'src/engine/core-modules/application/application-install/dtos/application-suggested-view-field.dto';
import { DismissApplicationSuggestedViewFieldsInput } from 'src/engine/core-modules/application/application-install/dtos/dismiss-application-suggested-view-fields.input';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(ApplicationExceptionFilter, AuthGraphqlApiExceptionFilter)
@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    },
    requiredPermissionFlags: [PermissionFlagType.APPLICATIONS],
  }),
)
export class ApplicationSuggestedViewFieldResolver {
  constructor(
    private readonly applicationSuggestedViewFieldService: ApplicationSuggestedViewFieldService,
  ) {}

  @Query(() => [ApplicationSuggestedViewFieldDTO])
  async applicationSuggestedViewFields(
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: AuthContextUser,
  ): Promise<ApplicationSuggestedViewFieldDTO[]> {
    return this.applicationSuggestedViewFieldService.findMissing({
      applicationId,
      workspaceId: workspace.id,
      userId: user.id,
    });
  }

  @Mutation(() => Boolean)
  async dismissApplicationSuggestedViewFields(
    @Args('input') input: DismissApplicationSuggestedViewFieldsInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: AuthContextUser,
  ): Promise<boolean> {
    await this.applicationSuggestedViewFieldService.dismiss({
      applicationId: input.applicationId,
      workspaceId: workspace.id,
      userId: user.id,
      universalIdentifiers: input.universalIdentifiers,
    });

    return true;
  }
}
