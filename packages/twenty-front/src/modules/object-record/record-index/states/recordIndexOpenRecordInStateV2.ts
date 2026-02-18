import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';

export const recordIndexOpenRecordInStateV2 =
  createStateV2<ViewOpenRecordInType>({
    key: 'recordIndexOpenRecordInStateV2',
    defaultValue: ViewOpenRecordInType.SIDE_PANEL,
  });
