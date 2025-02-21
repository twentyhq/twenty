import { createState } from '@ui/utilities/state/utils/createState';

import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';

export const recordIndexOpenRecordInState = createState<ViewOpenRecordInType>({
  key: 'recordIndexOpenRecordInState',
  defaultValue: ViewOpenRecordInType.SIDE_PANEL,
});
