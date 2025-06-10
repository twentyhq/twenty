import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { createState } from 'twenty-ui/utilities';

export const recordIndexOpenRecordInState = createState<ViewOpenRecordInType>({
  key: 'recordIndexOpenRecordInState',
  defaultValue: ViewOpenRecordInType.SIDE_PANEL,
});
