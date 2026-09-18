import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildCreatedByFromApiKey } from 'src/engine/core-modules/actor/utils/build-created-by-from-api-key.util';
import { buildCreatedByFromApplication } from 'src/engine/core-modules/actor/utils/build-created-by-from-application.util';
import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export type CoreWorkflowActorPrincipal = {
  workspaceId: string;
  userId?: string;
  application?: FlatApplication;
  apiKey?: FlatApiKey;
};

@Injectable()
export class CoreWorkflowActorWorkspaceService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async resolveActorOrThrow({
    workspaceId,
    userId,
    application,
    apiKey,
  }: CoreWorkflowActorPrincipal): Promise<ActorMetadata> {
    if (isDefined(userId)) {
      const workspaceMember = await this.findWorkspaceMemberByUserId({
        workspaceId,
        userId,
      });

      if (isDefined(workspaceMember)) {
        return buildCreatedByFromFullNameMetadata({
          fullNameMetadata: {
            firstName: workspaceMember.name.firstName,
            lastName: workspaceMember.name.lastName,
          },
          workspaceMemberId: workspaceMember.id,
        });
      }
    }

    if (isDefined(application)) {
      return buildCreatedByFromApplication({ application });
    }

    if (isDefined(apiKey)) {
      return buildCreatedByFromApiKey({ apiKey });
    }

    throw new WorkflowQueryValidationException(
      'No authenticated actor to attribute the workflow to',
      WorkflowQueryValidationExceptionCode.FORBIDDEN,
      {
        userFriendlyMessage: msg`Authentication is required to perform this action`,
      },
    );
  }

  async findWorkspaceMemberByUserId({
    workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }): Promise<WorkspaceMemberWorkspaceEntity | null> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      async () =>
        this.workspaceOrmManager
          .getRepository<WorkspaceMemberWorkspaceEntity>('workspaceMember', {
            shouldBypassPermissionChecks: true,
          })
          .findOne({ where: { userId } }),
      buildSystemAuthContext(workspaceId),
    );
  }
}
