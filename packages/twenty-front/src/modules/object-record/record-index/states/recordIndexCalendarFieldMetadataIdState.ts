import { createState } from '@/ui/utilities/state/utils/createState';

export const recordIndexCalendarFieldMetadataIdState = createState<
  string | null
>({
  key: 'recordIndexCalendarFieldMetadataIdState',
  defaultValue: null,
});
