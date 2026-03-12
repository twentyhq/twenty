import { Injectable } from '@nestjs/common';

import { sleep } from 'cloudflare/core';
import Fuse from 'fuse.js';
import { NavigateAppToolOutput } from 'twenty-shared/ai';
import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type NavigateAppInput,
  NavigateAppInputZodSchema,
} from 'src/engine/core-modules/tool/tools/navigate-tool/navigate-app-tool.schema';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import {
  type Tool,
  type ToolExecutionContext,
} from 'src/engine/core-modules/tool/types/tool.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { NavigationMenuItemService } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class NavigateAppTool implements Tool {
  description = `Navigate the application.
    Use navigateToRecord when the user wants to go to a specific record by name.
    Default to navigateToObject for all other navigation requests.
    Only use navigateToView when the user explicitly mentions the word "view" in their request.
    If the user asks to wait, use the wait tool with the specified duration.`;

  inputSchema = NavigateAppInputZodSchema;

  constructor(
    private readonly navigationMenuItemService: NavigationMenuItemService,
    private readonly viewService: ViewService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
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

    const input: NavigateAppInput = parseResult.data;

    switch (input.type) {
      case 'navigateToView':
        return this.navigateToView(
          input.viewName,
          context.workspaceId,
          context.userWorkspaceId,
        );
      case 'navigateToObject':
        return this.navigateToObject(
          input.objectNameSingular,
          context.workspaceId,
        );
      case 'navigateToRecord':
        return this.navigateToRecord(
          input.objectNameSingular,
          input.recordName,
          context.workspaceId,
        );
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

  private async navigateToView(
    viewName: string,
    workspaceId: string,
    userWorkspaceId?: string,
  ): Promise<ToolOutput<NavigateAppToolOutput>> {
    const views = await this.viewService.findByWorkspaceId(
      workspaceId,
      userWorkspaceId,
    );

    const fuse = new Fuse(views, {
      keys: ['name'],
      threshold: 0.4,
    });

    const results = fuse.search(viewName);
    const matchingView = results[0]?.item;

    if (!matchingView) {
      const availableViewNames = views.map((view) => view.name).join(', ');

      return {
        success: false,
        message: `View "${viewName}" not found`,
        error: `No view matching "${viewName}" was found in this workspace. Available views: ${availableViewNames}`,
      };
    }

    const { flatObjectMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const objectMetadataUniversalIdentifier =
      flatObjectMetadataMaps.universalIdentifierById[
        matchingView.objectMetadataId
      ];

    const objectMetadata = isDefined(objectMetadataUniversalIdentifier)
      ? flatObjectMetadataMaps.byUniversalIdentifier[
          objectMetadataUniversalIdentifier
        ]
      : undefined;

    if (!isDefined(objectMetadata)) {
      return {
        success: false,
        message: `Object metadata for view "${matchingView.name}" not found`,
        error: `Could not resolve the object associated with view "${matchingView.name}"`,
      };
    }

    return {
      success: true,
      message: `Navigating to view "${matchingView.name}"`,
      result: {
        action: 'navigateToView',
        viewId: matchingView.id,
        viewName: matchingView.name,
        objectNameSingular: objectMetadata.nameSingular,
      },
    };
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

    const availableObjectNames = navigationMenuItems
      .map((navigationMenuItem) => {
        if (isDefined(navigationMenuItem.viewId)) {
          const correspondingViewUniversalIdentifier =
            flatViewMaps.universalIdentifierById[navigationMenuItem.viewId];

          if (isDefined(correspondingViewUniversalIdentifier)) {
            const correspondingView =
              flatViewMaps.byUniversalIdentifier[
                correspondingViewUniversalIdentifier
              ];

            if (isDefined(correspondingView)) {
              const correspondingObjectMetadataUniversalIdentifier =
                flatObjectMetadataMaps.universalIdentifierById[
                  correspondingView.objectMetadataId
                ];

              if (isDefined(correspondingObjectMetadataUniversalIdentifier)) {
                const correspondingObjectMetadata =
                  flatObjectMetadataMaps.byUniversalIdentifier[
                    correspondingObjectMetadataUniversalIdentifier
                  ];

                if (isDefined(correspondingObjectMetadata)) {
                  const correspondingObjectNameSingular =
                    correspondingObjectMetadata.nameSingular;

                  return correspondingObjectNameSingular;
                }
              }
            }
          }
        }

        return null;
      })
      .filter(isDefined);

    const fuse = new Fuse(availableObjectNames, {
      threshold: 0.6,
    });

    const results = fuse.search(objectNameSingular.replace(/\s/g, ''));
    const firstMatchingNavigationItemLabel = results[0]?.item;

    if (!isDefined(firstMatchingNavigationItemLabel)) {
      return {
        success: false,
        message: `Object "${objectNameSingular}" not found`,
        error: `No object with singular name "${objectNameSingular}" was found in this workspace. Available objects: ${availableObjectNames}`,
      };
    }

    return {
      success: true,
      message: `Navigating to ${firstMatchingNavigationItemLabel} default view`,
      result: {
        action: 'navigateToObject',
        objectNameSingular: firstMatchingNavigationItemLabel,
      },
    };
  }

  private async navigateToRecord(
    objectNameSingular: string,
    recordName: string,
    workspaceId: string,
  ): Promise<ToolOutput<NavigateAppToolOutput>> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const flatObjectMetadata = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).find(
      (metadata): metadata is FlatObjectMetadata =>
        isDefined(metadata) &&
        metadata.nameSingular === objectNameSingular &&
        metadata.isActive,
    );

    if (!isDefined(flatObjectMetadata)) {
      const availableObjectNames = Object.values(
        flatObjectMetadataMaps.byUniversalIdentifier,
      )
        .filter(
          (metadata): metadata is FlatObjectMetadata =>
            isDefined(metadata) && metadata.isActive,
        )
        .map((metadata) => metadata.nameSingular)
        .join(', ');

      return {
        success: false,
        message: `Object "${objectNameSingular}" not found`,
        error: `No object with singular name "${objectNameSingular}" was found. Available objects: ${availableObjectNames}`,
      };
    }

    if (!isDefined(flatObjectMetadata.labelIdentifierFieldMetadataId)) {
      return {
        success: false,
        message: `Object "${objectNameSingular}" has no label identifier field`,
        error: `Cannot search records by name for object "${objectNameSingular}" because it has no label identifier field configured.`,
      };
    }

    const labelIdentifierField = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatObjectMetadata.labelIdentifierFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(labelIdentifierField)) {
      return {
        success: false,
        message: `Label identifier field not found for object "${objectNameSingular}"`,
        error: `The label identifier field metadata could not be resolved for object "${objectNameSingular}".`,
      };
    }

    const isFullName =
      labelIdentifierField.type === FieldMetadataType.FULL_NAME;

    const selectColumns = isFullName
      ? [
          'id',
          `${labelIdentifierField.name}FirstName`,
          `${labelIdentifierField.name}LastName`,
        ]
      : ['id', labelIdentifierField.name];

    const authContext = buildSystemAuthContext(workspaceId);

    const records =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const repository =
            await this.globalWorkspaceOrmManager.getRepository<ObjectRecord>(
              workspaceId,
              objectNameSingular,
              { shouldBypassPermissionChecks: true },
            );

          return repository.find({
            select: selectColumns,
          });
        },
        authContext,
      );

    const recordsWithDisplayName = records.map((record) => {
      let displayName: string;

      if (isFullName) {
        const firstName =
          (record[`${labelIdentifierField.name}FirstName`] as string) ?? '';
        const lastName =
          (record[`${labelIdentifierField.name}LastName`] as string) ?? '';

        displayName = `${firstName} ${lastName}`.trim();
      } else {
        displayName = String(record[labelIdentifierField.name] ?? '');
      }

      return {
        id: record.id as string,
        displayName,
      };
    });

    const fuse = new Fuse(recordsWithDisplayName, {
      keys: ['displayName'],
      threshold: 0.4,
    });

    const results = fuse.search(recordName);
    const matchingRecord = results[0]?.item;

    if (!isDefined(matchingRecord)) {
      return {
        success: false,
        message: `Record "${recordName}" not found in ${objectNameSingular}`,
        error: `No ${objectNameSingular} record matching "${recordName}" was found.`,
      };
    }

    return {
      success: true,
      message: `Navigating to ${objectNameSingular} record "${matchingRecord.displayName}"`,
      result: {
        action: 'navigateToRecord',
        objectNameSingular,
        recordId: matchingRecord.id,
      },
    };
  }
}
