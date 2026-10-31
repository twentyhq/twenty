import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationGrantDTO } from 'src/engine/core-modules/application/application-grant/dtos/application-grant.dto';
import { UpdateApplicationGrantObjectAccessInput } from 'src/engine/core-modules/application/application-grant/dtos/update-application-grant-object-access.input';
import { ApplicationGrantService } from 'src/engine/core-modules/application/application-grant/services/application-grant.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { FieldPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/field-permission.dto';
import { UpsertFieldPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';
import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import { fromFlatFieldPermissionToFieldPermissionDto } from 'src/engine/metadata-modules/object-permission/utils/from-flat-field-permission-to-field-permission-dto.util';
import { UpsertRowLevelPermissionPredicatesInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';
import { UpsertRowLevelPermissionPredicatesResultDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/upsert-row-level-permission-predicates-result.dto';
import { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(ApplicationExceptionFilter, AuthGraphqlApiExceptionFilter)
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: false,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  }),
  SettingsPermissionGuard([
    PermissionFlagType.APPLICATIONS,
    PermissionFlagType.ROLES,
  ]),
)
export class ApplicationGrantResolver {
  constructor(
    private readonly applicationGrantService: ApplicationGrantService,
    private readonly fieldPermissionService: FieldPermissionService,
    private readonly rowLevelPermissionPredicateService: RowLevelPermissionPredicateService,
  ) {}

  @Query(() => ApplicationGrantDTO)
  async applicationGrant(
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApplicationGrantDTO> {
    return this.applicationGrantService.getGrant({
      workspaceId: workspace.id,
      applicationId,
    });
  }

  @Mutation(() => ApplicationGrantDTO)
  async updateApplicationGrantObjectAccess(
    @Args('input') input: UpdateApplicationGrantObjectAccessInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApplicationGrantDTO> {
    await this.applicationGrantService.updateGrantObjectAccess({
      workspaceId: workspace.id,
      applicationId: input.applicationId,
      allObjectsActions: {
        canReadObjectRecords: input.canReadAllObjectRecords,
        canUpdateObjectRecords: input.canUpdateAllObjectRecords,
        canSoftDeleteObjectRecords: input.canSoftDeleteAllObjectRecords,
        canDestroyObjectRecords: input.canDestroyAllObjectRecords,
      },
      objectPermissions: input.objectPermissions,
    });

    return this.applicationGrantService.getGrant({
      workspaceId: workspace.id,
      applicationId: input.applicationId,
    });
  }

  @Mutation(() => ApplicationGrantDTO)
  async approveApplicationGrantPendingPermissions(
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApplicationGrantDTO> {
    await this.applicationGrantService.approvePendingPermissions({
      workspaceId: workspace.id,
      applicationId,
    });

    return this.applicationGrantService.getGrant({
      workspaceId: workspace.id,
      applicationId,
    });
  }

  @Mutation(() => [FieldPermissionDTO])
  async upsertApplicationGrantFieldPermissions(
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
    @Args('upsertFieldPermissionsInput')
    upsertFieldPermissionsInput: UpsertFieldPermissionsInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<FieldPermissionDTO[]> {
    await this.assertRoleIsApplicationGrant({
      workspaceId: workspace.id,
      applicationId,
      roleId: upsertFieldPermissionsInput.roleId,
    });

    const flatFieldPermissions =
      await this.fieldPermissionService.upsertFieldPermissions({
        workspaceId: workspace.id,
        input: upsertFieldPermissionsInput,
        isSystemBuild: true,
      });

    return flatFieldPermissions.map(
      fromFlatFieldPermissionToFieldPermissionDto,
    );
  }

  @Mutation(() => UpsertRowLevelPermissionPredicatesResultDTO)
  async upsertApplicationGrantRowLevelPermissionPredicates(
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
    @Args('input') input: UpsertRowLevelPermissionPredicatesInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<UpsertRowLevelPermissionPredicatesResultDTO> {
    await this.assertRoleIsApplicationGrant({
      workspaceId: workspace.id,
      applicationId,
      roleId: input.roleId,
    });

    return this.rowLevelPermissionPredicateService.upsertRowLevelPermissionPredicates(
      { workspaceId: workspace.id, input, isSystemBuild: true },
    );
  }

  private async assertRoleIsApplicationGrant({
    workspaceId,
    applicationId,
    roleId,
  }: {
    workspaceId: string;
    applicationId: string;
    roleId: string;
  }): Promise<void> {
    const grantRoleId =
      await this.applicationGrantService.getGrantRoleIdOrThrow({
        workspaceId,
        applicationId,
      });

    if (grantRoleId !== roleId) {
      throw new ApplicationException(
        `Role ${roleId} is not the granted role of application ${applicationId}`,
        ApplicationExceptionCode.FORBIDDEN,
      );
    }
  }
}
