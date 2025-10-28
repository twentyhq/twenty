import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { ViewOpenRecordIn as CoreViewOpenRecordIn } from '~/generated/graphql';

export const convertCoreViewOpenRecordInToViewOpenRecordIn = (
  openIn: CoreViewOpenRecordIn,
): ViewOpenRecordInType => {
  return openIn === CoreViewOpenRecordIn.SIDE_PANEL
    ? ViewOpenRecordInType.SIDE_PANEL
    : ViewOpenRecordInType.RECORD_PAGE;
};
