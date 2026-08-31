import { CoreWorkflowStatus } from 'src/engine/core-modules/workflow/dtos/core-workflows.input';

const HAS_DRAFT_VERSION = `coalesce(bool_or(v.status = 'DRAFT'), false)`;
const HAS_ACTIVE_VERSION = `coalesce(bool_or(v.status = 'ACTIVE'), false)`;
const HAS_DEACTIVATED_VERSION = `coalesce(bool_or(v.status = 'DEACTIVATED'), false)`;

// Mirrors computeCoreWorkflowStatuses so filtering matches the derived
// statuses the connection returns
const STATUS_PREDICATE_BY_STATUS: Record<CoreWorkflowStatus, string> = {
  [CoreWorkflowStatus.DRAFT]: HAS_DRAFT_VERSION,
  [CoreWorkflowStatus.ACTIVE]: HAS_ACTIVE_VERSION,
  [CoreWorkflowStatus.DEACTIVATED]: `(NOT ${HAS_ACTIVE_VERSION} AND ${HAS_DEACTIVATED_VERSION})`,
};

export const buildCoreWorkflowStatusesHavingClause = (
  statuses: CoreWorkflowStatus[],
): string =>
  statuses.map((status) => STATUS_PREDICATE_BY_STATUS[status]).join(' OR ');
