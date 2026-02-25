import { Injectable } from '@nestjs/common';

import Fuse from 'fuse.js';
import { NavigateAppToolOutput } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import {
  type NavigateAppInput,
  NavigateAppInputZodSchema,
} from 'src/engine/core-modules/tool/tools/navigate-tool/navigate-app-tool.schema';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import {
  type Tool,
  type ToolExecutionContext,
} from 'src/engine/core-modules/tool/types/tool.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { NavigationMenuItemService } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';

@Injectable()
export class NavigateAppTool implements Tool {
  description =
    'Navigate the application. Default to navigateToObject for all navigation requests. Only use navigateToView when the user explicitly mentions the word "view" in their request.';

  inputSchema = NavigateAppInputZodSchema;

  constructor(
    private readonly navigationMenuItemService: NavigationMenuItemService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly viewService: ViewService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
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
    }
  }

  private async navigateToView(
    viewName: string,
    workspaceId: string,
    userWorkspaceId?: string,
  ): Promise<ToolOutput> {
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

    return {
      success: true,
      message: `Navigating to view "${matchingView.name}"`,
      result: {
        action: 'navigateToIndexPageView',
        viewName: matchingView.name,
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
        action: 'navigateToDefaultViewForObject',
        objectNameSingular: firstMatchingNavigationItemLabel,
      },
    };
  }
}
