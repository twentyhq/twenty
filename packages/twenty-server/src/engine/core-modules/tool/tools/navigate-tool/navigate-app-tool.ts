import { Injectable } from '@nestjs/common';

import { sleep } from 'cloudflare/core';
import Fuse from 'fuse.js';
import { NavigateAppToolOutput } from 'twenty-shared/ai';
import { FeatureFlagKey, type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  type NavigateAppInput,
  NavigateAppInputZodSchema,
} from 'src/engine/core-modules/tool/tools/navigate-tool/navigate-app-tool.schema';
import { buildNavigateToRecordOutput } from 'src/engine/core-modules/tool/tools/navigate-tool/utils/build-navigate-to-record-output.util';
import { buildNavigateToViewOutput } from 'src/engine/core-modules/tool/tools/navigate-tool/utils/build-navigate-to-view-output.util';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { NavigationMenuItemService } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { getObjectsPermissionsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-objects-permissions-from-role-permission-config.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class NavigateAppTool implements Tool {
  description = `Navigate the application.
    Use navigateToRecord to open a specific record. It needs the record id: find it first with the find_* tools, or take it from the result of the tool that created the record.
    Default to navigateToObject for all other navigation requests.
    Only use navigateToView when the user explicitly mentions the word "view" in their request, or right after creating a view. It needs the view id from get_views or from the tool that created the view.
    If the user asks to wait, use the wait tool with the specified duration.`;

  inputSchema = NavigateAppInputZodSchema;

  constructor(
    private readonly navigationMenuItemService: NavigationMenuItemService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async execute(
    parameters: ToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const parseResult = NavigateAppInputZodSchema.safeParse(parameters);

    if (!parseResult.success) {
      return {
        success: false,
        message: 'Invalid navigation input',
        error: parseResult.error.message,
      };
    }

    const input: NavigateAppInput['navigation'] = parseResult.data.navigation;

    switch (input.type) {
      case 'navigateToView':
        return this.navigateToView({
          viewId: input.viewId,
          workspaceId: context.workspaceId,
          userWorkspaceId: context.userWorkspaceId,
        });
      case 'navigateToObject':
        return this.navigateToObject(
          input.objectNameSingular,
          context.workspaceId,
        );
      case 'navigateToRecord':
        return this.navigateToRecord({
          objectNameSingular: input.objectNameSingular,
          recordId: input.recordId,
          workspaceId: context.workspaceId,
          rolePermissionConfig: context.rolePermissionConfig,
        });
      case 'wait':
        return this.wait(input.durationMs);
    }
  }

  private async wait(
    durationMs: number,
  ): Promise<ToolOutput<NavigateAppToolOutput>> {
    await sleep(durationMs);

    return {
      success: true,
      message: `Waited  for ${durationMs}ms`,
      result: {
        action: 'wait',
        durationMs,
      },
    };
  }

  private async navigateToView({
    viewId,
    workspaceId,
    userWorkspaceId,
  }: {
    viewId: string;
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<ToolOutput<NavigateAppToolOutput>> {
    const { flatObjectMetadataMaps, flatViewMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatViewMaps'],
        },
      );

    const isInitialObjectViewEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_INITIAL_OBJECT_VIEW_ENABLED,
        workspaceId,
      );

    return buildNavigateToViewOutput({
      viewId,
      flatView: findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: viewId,
        flatEntityMaps: flatViewMaps,
      }),
      userWorkspaceId,
      isInitialObjectViewEnabled,
      flatObjectMetadataMaps,
    });
  }

  private async navigateToObject(
    objectNameSingular: string,
    workspaceId: string,
  ): Promise<ToolOutput<NavigateAppToolOutput>> {
    const navigationMenuItems = await this.navigationMenuItemService.findAll({
      workspaceId,
    });

    const { flatObjectMetadataMaps, flatViewMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatObjectMetadataMaps',
            'flatViewMaps',
            'flatNavigationMenuItemMaps',
          ],
        },
      );

    type NavigatableObject = {
      nameSingular: string;
      labelSingular: string;
      labelPlural: string;
    };

    const navigatableObjects = navigationMenuItems
      .map<NavigatableObject | null>((navigationMenuItem) => {
        const objectMetadataId =
          navigationMenuItem.type === NavigationMenuItemType.OBJECT
            ? navigationMenuItem.targetObjectMetadataId
            : navigationMenuItem.type === NavigationMenuItemType.VIEW &&
                isDefined(navigationMenuItem.viewId)
              ? flatViewMaps.byUniversalIdentifier[
                  flatViewMaps.universalIdentifierById[
                    navigationMenuItem.viewId
                  ] ?? ''
                ]?.objectMetadataId
              : undefined;

        if (!isDefined(objectMetadataId)) {
          return null;
        }

        const objectMetadataUniversalIdentifier =
          flatObjectMetadataMaps.universalIdentifierById[objectMetadataId];

        if (!isDefined(objectMetadataUniversalIdentifier)) {
          return null;
        }

        const objectMetadata =
          flatObjectMetadataMaps.byUniversalIdentifier[
            objectMetadataUniversalIdentifier
          ];

        if (!isDefined(objectMetadata)) {
          return null;
        }

        return {
          nameSingular: objectMetadata.nameSingular,
          labelSingular: objectMetadata.labelSingular,
          labelPlural: objectMetadata.labelPlural,
        };
      })
      .filter(isDefined);

    const fuse = new Fuse(navigatableObjects, {
      keys: ['nameSingular', 'labelSingular', 'labelPlural'],
      threshold: 0.4,
    });

    const results = fuse.search(objectNameSingular);
    const matchingObject = results[0]?.item;

    if (!isDefined(matchingObject)) {
      const availableLabels = navigatableObjects
        .map((object) => object.labelPlural)
        .join(', ');

      return {
        success: false,
        message: `Object "${objectNameSingular}" not found`,
        error: `No object matching "${objectNameSingular}" was found in this workspace. Available objects: ${availableLabels}`,
      };
    }

    return {
      success: true,
      message: `Navigating to ${matchingObject.labelPlural} default view`,
      result: {
        action: 'navigateToObject',
        objectNameSingular: matchingObject.nameSingular,
      },
    };
  }

  private async navigateToRecord({
    objectNameSingular,
    recordId,
    workspaceId,
    rolePermissionConfig,
  }: {
    objectNameSingular: string;
    recordId: string;
    workspaceId: string;
    rolePermissionConfig?: RolePermissionConfig;
  }): Promise<ToolOutput<NavigateAppToolOutput>> {
    const { flatObjectMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    return buildNavigateToRecordOutput({
      objectNameSingular,
      recordId,
      flatObjectMetadataMaps,
      objectsPermissions: await this.getObjectsPermissions({
        workspaceId,
        rolePermissionConfig,
      }),
    });
  }

  // Missing or unloadable permissions fail closed into the not found result
  private async getObjectsPermissions({
    workspaceId,
    rolePermissionConfig,
  }: {
    workspaceId: string;
    rolePermissionConfig?: RolePermissionConfig;
  }): Promise<ObjectsPermissions> {
    if (!isDefined(rolePermissionConfig)) {
      return {};
    }

    try {
      const { rolesPermissions } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'rolesPermissions',
        ]);

      return getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        rolePermissionConfig,
      });
    } catch {
      return {};
    }
  }
}
