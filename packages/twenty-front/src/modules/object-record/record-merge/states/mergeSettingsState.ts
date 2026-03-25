import { type MergeManySettings } from '@/object-record/hooks/useMergeManyRecords';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const mergeSettingsState = createAtomState<MergeManySettings>({
  key: 'mergeSettingsState',
  defaultValue: {
    conflictPriorityIndex: 0,
  },
});
