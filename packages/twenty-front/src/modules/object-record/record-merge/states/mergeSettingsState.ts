import { type MergeManySettings } from '@/object-record/hooks/useMergeManyRecords';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const mergeSettingsState = createStateV2<MergeManySettings>({
  key: 'mergeSettingsState',
  defaultValue: {
    conflictPriorityIndex: 0,
  },
});
