import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const viewableRecordIdState = createState<string | null>({
  key: 'activities/viewable-record-id',
  defaultValue: null,
});
