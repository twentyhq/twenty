import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const viewableRecordIdState = createStateV2<string | null>({
  key: 'activities/viewable-record-id',
  defaultValue: null,
});
