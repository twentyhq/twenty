import { type ActorMetadata } from 'twenty-shared/types';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const LEGACY_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-62be-406c-b9ca-8caa50d51392';
export const LEGACY_WORKFLOW_VERSION_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-d65d-4ab9-9344-d77bfb376a3d';
export const LEGACY_WORKFLOW_AUTOMATED_TRIGGER_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-3319-4234-a34c-7f3b9d2e4d1f';
export const LEGACY_WORKFLOW_CORE_WORKFLOW_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-058a-42ad-8eb8-0662a5552aad';
export const LEGACY_WORKFLOW_VERSION_CORE_WORKFLOW_VERSION_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-58b4-46e8-b6d2-f1f3c74cf7f4';
export const LEGACY_ATTACHMENT_TARGET_WORKFLOW_FIELD_UNIVERSAL_IDENTIFIER =
  'edbe3ea7-b9ff-5b23-9a81-ef53a190c873';

export type LegacyWorkflowVersionStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'DEACTIVATED'
  | 'ARCHIVED';

export type LegacyWorkflowWorkspaceEntity = {
  id: string;
  name: string | null;
  lastPublishedVersionId: string | null;
  coreWorkflowId: string | null;
  statuses: string[] | null;
  position: number;
  createdBy: ActorMetadata;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type LegacyWorkflowVersionWorkspaceEntity = {
  id: string;
  name: string | null;
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
  coreWorkflowVersionId: string | null;
  status: LegacyWorkflowVersionStatus;
  position: number;
  workflowId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type LegacyWorkflowAutomatedTriggerWorkspaceEntity = {
  id: string;
  type: 'DATABASE_EVENT' | 'CRON';
  settings: Record<string, unknown>;
  workflowId: string;
};
