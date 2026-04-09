import { Injectable } from '@nestjs/common';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  type AutomatedTriggerType,
  type WorkflowAutomatedTriggerWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { type AutomatedTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';

@Injectable()
export class AutomatedTriggerWorkspaceService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async addAutomatedTrigger({
    workflowId,
    type,
    settings,
    workspaceId,
    entityManager,
  }: {
    workflowId: string;
    type: AutomatedTriggerType;
    settings: AutomatedTriggerSettings;
    workspaceId: string;
    entityManager?: WorkspaceEntityManager;
  }) {
    const workflowAutomatedTriggerRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkflowAutomatedTriggerWorkspaceEntity>(
        workspaceId,
        'workflowAutomatedTrigger',
      );

    if (isDefined(entityManager)) {
      await workflowAutomatedTriggerRepository.insert(
        { type, settings, workflowId },
        entityManager,
      );

      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await workflowAutomatedTriggerRepository.insert({
        type,
        settings,
        workflowId,
      });
    }, authContext);
  }

  async deleteAutomatedTrigger({
    workflowId,
    workspaceId,
    entityManager,
  }: {
    workflowId: string;
    workspaceId: string;
    entityManager?: WorkspaceEntityManager;
  }) {
    const workflowAutomatedTriggerRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkflowAutomatedTriggerWorkspaceEntity>(
        workspaceId,
        'workflowAutomatedTrigger',
      );

    if (isDefined(entityManager)) {
      await workflowAutomatedTriggerRepository.delete(
        { workflowId },
        entityManager,
      );

      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await workflowAutomatedTriggerRepository.delete({ workflowId });
    }, authContext);
  }
}
