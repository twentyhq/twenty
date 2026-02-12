import { type MergeManySettings } from '@/object-record/hooks/useMergeManyRecords';
import { createState } from '@/ui/utilities/state/utils/createState';

export const mergeSettingsState = createState<MergeManySettings>({
  key: 'mergeSettingsState',
  defaultValue: {
    conflictPriorityIndex: 0,
  },
});
