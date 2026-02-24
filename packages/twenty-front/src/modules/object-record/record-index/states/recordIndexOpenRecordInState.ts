import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const recordIndexOpenRecordInState = createStateV2<ViewOpenRecordInType>(
  {
    key: 'recordIndexOpenRecordInState',
    defaultValue: ViewOpenRecordInType.SIDE_PANEL,
  },
);
