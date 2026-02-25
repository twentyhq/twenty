import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';

export const recordIndexOpenRecordInStateV2 =
  createAtomState<ViewOpenRecordInType>({
    key: 'recordIndexOpenRecordInStateV2',
    defaultValue: ViewOpenRecordInType.SIDE_PANEL,
  });
