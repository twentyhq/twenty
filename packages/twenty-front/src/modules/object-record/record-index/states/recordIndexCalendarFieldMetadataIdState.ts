import { createState } from 'twenty-ui/utilities';

export const recordIndexCalendarFieldMetadataIdState = createState<
  string | null
>({
  key: 'recordIndexCalendarFieldMetadataIdState',
  defaultValue: null,
});
