import { ViewOpenRecordIn } from '~/generated/graphql';

export const convertViewOpenRecordInToCore = (
  viewOpenRecordIn: string,
): ViewOpenRecordIn => {
  return viewOpenRecordIn === ViewOpenRecordIn.SIDE_PANEL
    ? ViewOpenRecordIn.SIDE_PANEL
    : ViewOpenRecordIn.RECORD_PAGE;
};
