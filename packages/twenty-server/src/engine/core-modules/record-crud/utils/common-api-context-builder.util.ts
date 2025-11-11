import { Injectable } from '@nestjs/common';

import { type ActorMetadata } from 'twenty-shared/types';

import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

@Injectable()
export class CommonApiContextBuilder {
  constructor(
    private readonly workspaceMetadataCache: WorkspaceMetadataCacheService,
  ) {}

  async build(params: {
    objectName: string;
    workspaceId: string;
    userWorkspaceId?: string;
    apiKey?: ApiKeyEntity;
    rolePermissionConfig?: RolePermissionConfig;
    actorContext?: ActorMetadata;
  }): Promise<{
    queryRunnerContext: CommonBaseQueryRunnerContext;
    selectedFields: Record<string, boolean>;
  }> {
    if (!params.userWorkspaceId && !params.apiKey) {
      throw new Error(
        'Either userWorkspaceId or apiKey is required for Common API operations',
      );
    }

    const { objectMetadataMaps } =
      await this.workspaceMetadataCache.getExistingOrRecomputeMetadataMaps({
        workspaceId: params.workspaceId,
      });

    const objectMetadata = this.getObjectMetadataOrThrow(
      params.objectName,
      objectMetadataMaps,
    );

    const authContext = this.buildAuthContext(
      params.workspaceId,
      params.userWorkspaceId,
      params.apiKey,
      params.actorContext,
    );

    const selectedFields = this.buildSelectedFields(objectMetadata);

    return {
      queryRunnerContext: {
        authContext,
        objectMetadataItemWithFieldMaps: objectMetadata,
        objectMetadataMaps,
      },
      selectedFields,
    };
  }

  private getObjectMetadataOrThrow(
    objectName: string,
    objectMetadataMaps: {
      byId: Partial<Record<string, ObjectMetadataItemWithFieldMaps>>;
      idByNameSingular: Partial<Record<string, string>>;
    },
  ): ObjectMetadataItemWithFieldMaps {
    const objectMetadataId = objectMetadataMaps.idByNameSingular[objectName];

    if (!objectMetadataId) {
      throw new Error(`Object ${objectName} not found in workspace`);
    }

    const objectMetadata = objectMetadataMaps.byId[objectMetadataId];

    if (!objectMetadata) {
      throw new Error(`Object metadata not found for ${objectName}`);
    }

    return objectMetadata;
  }

  private buildAuthContext(
    workspaceId: string,
    userWorkspaceId?: string,
    apiKey?: ApiKeyEntity,
    actorContext?: ActorMetadata,
  ): AuthContext {
    // Workspace object is intentionally minimal - the Common API validates
    // and enriches the auth context internally
    return {
      workspace: { id: workspaceId } as unknown as AuthContext['workspace'],
      workspaceMemberId: actorContext?.workspaceMemberId ?? undefined,
      userWorkspaceId,
      apiKey,
      user: null,
    };
  }

  private buildSelectedFields(
    objectMetadata: ObjectMetadataItemWithFieldMaps,
  ): Record<string, boolean> {
    const selectedFields: Record<string, boolean> = { id: true };

    for (const fieldName of Object.keys(objectMetadata.fieldIdByName)) {
      selectedFields[fieldName] = true;
    }

    return selectedFields;
  }
}
