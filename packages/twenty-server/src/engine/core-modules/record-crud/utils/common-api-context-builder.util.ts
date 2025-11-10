import { Injectable } from '@nestjs/common';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';

@Injectable()
export class CommonApiContextBuilder {
  constructor(
    private readonly workspaceMetadataCache: WorkspaceMetadataCacheService,
  ) {}

  async build(params: {
    objectName: string;
    workspaceId: string;
    rolePermissionConfig?: RolePermissionConfig;
    userWorkspaceId?: string;
  }): Promise<{
    queryRunnerContext: CommonBaseQueryRunnerContext;
    selectedFields: Record<string, boolean>;
  }> {
    const { objectMetadataMaps } =
      await this.workspaceMetadataCache.getExistingOrRecomputeMetadataMaps({
        workspaceId: params.workspaceId,
      });

    const objectMetadataId =
      objectMetadataMaps.idByNameSingular[params.objectName];

    if (!objectMetadataId) {
      throw new Error(`Object ${params.objectName} not found in workspace`);
    }

    const objectMetadata = objectMetadataMaps.byId[objectMetadataId];

    if (!objectMetadata) {
      throw new Error(`Object metadata not found for ${params.objectName}`);
    }

    // Build auth context for Common API
    // userWorkspaceId should be the real user's ID (workflow initiator or workflow creator)
    // If somehow we don't have one, throw an error rather than using a fake ID
    if (!params.userWorkspaceId) {
      throw new Error(
        'userWorkspaceId is required for Common API. Workflows must provide the workflow run creator or initiator userWorkspaceId.',
      );
    }

    const authContext = {
      workspace: { id: params.workspaceId },
      workspaceId: params.workspaceId,
      user: null,
      workspaceMemberId: null,
      userWorkspaceId: params.userWorkspaceId,
      apiKey: null,
    } as unknown as WorkspaceAuthContext;

    // Build selected fields (all non-relation fields)
    const selectedFields: Record<string, boolean> = { id: true };

    Object.entries(objectMetadata.fieldIdByName).forEach(([fieldName]) => {
      selectedFields[fieldName] = true;
    });

    return {
      queryRunnerContext: {
        authContext,
        objectMetadataItemWithFieldMaps: objectMetadata,
        objectMetadataMaps,
      },
      selectedFields,
    };
  }
}
