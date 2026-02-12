import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { createState } from '@/ui/utilities/state/utils/createState';

export const recordIndexOpenRecordInState = createState<ViewOpenRecordInType>({
  key: 'recordIndexOpenRecordInState',
  defaultValue: ViewOpenRecordInType.SIDE_PANEL,
});
