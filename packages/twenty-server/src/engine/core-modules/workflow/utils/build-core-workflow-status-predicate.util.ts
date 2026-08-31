import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

const HAS_DRAFT_VERSION = `coalesce(bool_or(v.status = 'DRAFT'), false)`;
const HAS_ACTIVE_VERSION = `coalesce(bool_or(v.status = 'ACTIVE'), false)`;
const HAS_DEACTIVATED_VERSION = `coalesce(bool_or(v.status = 'DEACTIVATED'), false)`;

// Mirrors computeWorkflowStatuses so filtering matches the derived
// statuses the connection returns
const STATUS_PREDICATE_BY_STATUS: Record<WorkflowStatus, string> = {
  [WorkflowStatus.DRAFT]: HAS_DRAFT_VERSION,
  [WorkflowStatus.ACTIVE]: HAS_ACTIVE_VERSION,
  [WorkflowStatus.DEACTIVATED]: `(NOT ${HAS_ACTIVE_VERSION} AND ${HAS_DEACTIVATED_VERSION})`,
};

export const buildCoreWorkflowHasAnyOfStatusesPredicate = (
  statuses: WorkflowStatus[],
): string =>
  `(${statuses.map((status) => STATUS_PREDICATE_BY_STATUS[status]).join(' OR ')})`;

export const CORE_WORKFLOW_HAS_ANY_STATUS_PREDICATE =
  buildCoreWorkflowHasAnyOfStatusesPredicate(Object.values(WorkflowStatus));
