import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordIndexOpenRecordInState =
  createAtomState<ViewOpenRecordInType>({
    key: 'recordIndexOpenRecordInState',
    defaultValue: ViewOpenRecordInType.SIDE_PANEL,
  });
