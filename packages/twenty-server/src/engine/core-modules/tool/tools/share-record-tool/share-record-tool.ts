import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/core-modules/record-share/record-share.exception';
import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';
import { ShareRecordToolInputZodSchema } from 'src/engine/core-modules/tool/tools/share-record-tool/share-record-tool.schema';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { getObjectMetadataIdByName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-object-metadata-id-by-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const FAILURE_MESSAGE = 'Failed to share record';

@Injectable()
export class ShareRecordTool implements Tool {
  description =
    'Share a record with a workspace member or with every member of a role, at a READ, READ_WRITE or FULL access level. Sharing again with the same member or role replaces their access level. Only works on records whose object supports record-level sharing, and only when the caller can manage the sharing of that record.';

  inputSchema = ShareRecordToolInputZodSchema;
  isReadOnly = false;

  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordSharingService: RecordSharingService,
  ) {}

  isEnabled(workspaceId: string): Promise<boolean> {
    return this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      workspaceId,
    );
  }

  async execute(
    parameters: ToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    if (!(await this.isEnabled(context.workspaceId))) {
      return {
        success: false,
        message: FAILURE_MESSAGE,
        error: 'Record sharing is not enabled in this workspace',
      };
    }

    const parseResult = ShareRecordToolInputZodSchema.safeParse(parameters);

    if (!parseResult.success) {
      return {
        success: false,
        message: FAILURE_MESSAGE,
        error: parseResult.error.message,
      };
    }

    const { authContext } = context;

    if (!isDefined(authContext) || !isUserAuthContext(authContext)) {
      return {
        success: false,
        message: FAILURE_MESSAGE,
        error: 'Sharing a record requires a signed-in user',
      };
    }

    const {
      objectNameSingular,
      recordId,
      workspaceMemberId,
      roleId,
      accessLevel,
    } = parseResult.data;

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(context.workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const objectMetadataId = getObjectMetadataIdByName({
      flatObjectMetadataMaps,
      objectName: objectNameSingular,
    });

    if (!isDefined(objectMetadataId)) {
      return {
        success: false,
        message: FAILURE_MESSAGE,
        error: `Object "${objectNameSingular}" not found`,
      };
    }

    try {
      await this.recordSharingService.setShare({
        objectMetadataId,
        recordId,
        principal: {
          workspaceMemberId: workspaceMemberId ?? undefined,
          roleId: roleId ?? undefined,
        },
        accessLevel,
        authContext,
      });
    } catch (error) {
      if (
        error instanceof RecordShareException &&
        error.code === RecordShareExceptionCode.INVALID_SHARE_WITH
      ) {
        return {
          success: false,
          message: FAILURE_MESSAGE,
          error: error.message,
        };
      }

      if (error instanceof NotFoundError) {
        return {
          success: false,
          message: FAILURE_MESSAGE,
          error:
            'Record not found, its object does not support record-level sharing, or you are not allowed to manage its sharing',
        };
      }

      throw error;
    }

    return {
      success: true,
      message: `Shared ${objectNameSingular} record with ${isDefined(workspaceMemberId) ? 'workspace member' : 'role'} at ${accessLevel} access`,
      result: {
        objectNameSingular,
        recordId,
        workspaceMemberId,
        roleId,
        accessLevel,
      },
    };
  }
}
