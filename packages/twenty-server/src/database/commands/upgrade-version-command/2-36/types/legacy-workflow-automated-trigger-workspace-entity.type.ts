import { type AutomatedTriggerType } from 'src/engine/core-modules/workflow/enums/automated-trigger-type.enum';
import { type BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type AutomatedTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';

export type LegacyWorkflowAutomatedTriggerWorkspaceEntity =
  BaseWorkspaceEntity & {
    type: AutomatedTriggerType;
    settings: AutomatedTriggerSettings;
    workflowId: string;
  };
