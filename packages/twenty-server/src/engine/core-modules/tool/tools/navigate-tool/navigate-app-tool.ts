import { Injectable } from '@nestjs/common';

import { NavigateAppToolOutput } from 'twenty-shared/ai';
import { ILike } from 'typeorm';

import { NavigateAppInputZodSchema } from 'src/engine/core-modules/tool/tools/navigate-tool/navigate-app-tool.schema';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import {
  type Tool,
  type ToolExecutionContext,
} from 'src/engine/core-modules/tool/types/tool.type';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';

@Injectable()
export class NavigateAppTool implements Tool {
  description =
    'Navigate the application to a specific view by name or to the default view for an object. Use this when the user wants to go to a page, open a list, or navigate somewhere in the app.';

  inputSchema = NavigateAppInputZodSchema;

  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly viewService: ViewService,
  ) {}

  async execute(
    parameters: ToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const input = parameters as { type: string; [key: string]: unknown };

    if (input.type === 'navigateToView') {
      return this.navigateToView(
        input.viewName as string,
        context.workspaceId,
        context.userWorkspaceId,
      );
    }

    if (input.type === 'navigateToObject') {
      return this.navigateToObject(
        input.objectNameSingular as string,
        context.workspaceId,
      );
    }

    return {
      success: false,
      message: 'Invalid navigation type',
      error: `Unknown navigation type: ${input.type}`,
    };
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

    const matchingView = views.find((view) =>
      view.name.toLowerCase().includes(viewName.toLowerCase()),
    );

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
    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          nameSingular: ILike(`%${objectNameSingular}%`),
        },
      });

    if (!objectMetadata) {
      return {
        success: false,
        message: `Object "${objectNameSingular}" not found`,
        error: `No object with singular name "${objectNameSingular}" was found in this workspace.`,
      };
    }

    return {
      success: true,
      message: `Navigating to ${objectMetadata.labelSingular} default view`,
      result: {
        action: 'navigateToDefaultViewForObject',
        objectNameSingular: objectMetadata.nameSingular,
      },
    };
  }
}
