import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const recordIndexOpenRecordInState = createState<ViewOpenRecordInType>({
  key: 'recordIndexOpenRecordInState',
  defaultValue: ViewOpenRecordInType.SIDE_PANEL,
});
