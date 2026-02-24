import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const recordIndexCalendarFieldMetadataIdState = createState<
  string | null
>({
  key: 'recordIndexCalendarFieldMetadataIdState',
  defaultValue: null,
});
