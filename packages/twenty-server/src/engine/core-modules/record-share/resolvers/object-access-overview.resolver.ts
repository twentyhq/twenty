/* @license Enterprise */

import { UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ObjectAccessOverviewDTO } from 'src/engine/core-modules/record-share/dtos/object-access-overview.dto';
import { ObjectAccessOverviewService } from 'src/engine/core-modules/record-share/services/object-access-overview.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';

@MetadataResolver()
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: { withUser: true, withoutUser: false },
    application: { withUser: true, withoutUser: false },
  }),
  SettingsPermissionGuard(PermissionFlagType.DATA_MODEL),
)
export class ObjectAccessOverviewResolver {
  constructor(
    private readonly objectAccessOverviewService: ObjectAccessOverviewService,
  ) {}

  @Query(() => ObjectAccessOverviewDTO)
  objectAccessOverview(
    @Args('objectMetadataId', { type: () => UUIDScalarType })
    objectMetadataId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ObjectAccessOverviewDTO> {
    return this.objectAccessOverviewService.getObjectAccessOverview({
      workspaceId,
      objectMetadataId,
    });
  }
}
