import { type getCoreAgentEditStatus } from '@/object-core/agents/utils/getCoreAgentEditStatus';
import { type CoreAgentCommandTarget } from '@/object-core/commands/types/CoreAgentCommandTarget';
import { isDefined } from 'twenty-shared/utils';

type GetCoreAgentCommandAvailabilityArgs = {
  target: CoreAgentCommandTarget;
  canManageAgents: boolean;
  isInPreviewMode: boolean;
  isCreating: boolean;
  selectedCount: number;
  isDeleting: boolean;
  record: Pick<
    ReturnType<typeof getCoreAgentEditStatus>,
    'session' | 'isEditable' | 'isDirty' | 'isSaving' | 'canSave'
  >;
  view: 'settings' | 'runs';
  canShowRuns: boolean;
};

export const getCoreAgentCommandAvailability = ({
  target,
  canManageAgents,
  isInPreviewMode,
  isCreating,
  selectedCount,
  isDeleting,
  record,
  view,
  canShowRuns,
}: GetCoreAgentCommandAvailabilityArgs) => {
  const isIndex = target.type === 'index' && !isInPreviewMode;
  const isRecord =
    target.type === 'record' && isDefined(record.session) && !isInPreviewMode;
  const canEditRecord = isRecord && record.isEditable;
  const hasPendingEdits = canEditRecord && (record.isDirty || record.isSaving);
  return {
    create: { visible: isIndex && canManageAgents, disabled: isCreating },
    filter: { visible: isIndex, disabled: false },
    'delete-selection': {
      visible: isIndex && canManageAgents && selectedCount > 0,
      disabled: isDeleting,
    },
    'selection-runs': {
      visible: isIndex && canManageAgents && selectedCount === 1 && canShowRuns,
      disabled: isDeleting,
    },
    save: { visible: hasPendingEdits, disabled: !record.canSave },
    cancel: { visible: hasPendingEdits, disabled: record.isSaving },
    delete: { visible: canEditRecord, disabled: record.isSaving },
    runs: {
      visible:
        isRecord && canManageAgents && canShowRuns && view === 'settings',
      disabled: false,
    },
    settings: {
      visible: isRecord && canShowRuns && view === 'runs',
      disabled: false,
    },
  };
};
