import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const recordIndexCalendarFieldMetadataIdState = createStateV2<
  string | null
>({
  key: 'recordIndexCalendarFieldMetadataIdState',
  defaultValue: null,
});
