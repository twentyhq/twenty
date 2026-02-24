import { createState } from '@/ui/utilities/state/jotai/utils/createState';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';

export const recordIndexOpenRecordInStateV2 = createState<ViewOpenRecordInType>(
  {
    key: 'recordIndexOpenRecordInStateV2',
    defaultValue: ViewOpenRecordInType.SIDE_PANEL,
  },
);
