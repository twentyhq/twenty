import { MergeManySettings } from '@/object-record/hooks/useMergeManyRecords';
import { createState } from 'twenty-ui/utilities';

export const mergeSettingsState = createState<MergeManySettings>({
  key: 'mergeSettingsState',
  defaultValue: {
    priorityRecordIndex: 0,
  },
});
