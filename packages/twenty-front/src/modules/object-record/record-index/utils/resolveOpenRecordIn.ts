import { ObjectOpenRecordIn, OpenRecordIn } from 'twenty-shared/types';

type ResolveOpenRecordInArgs = {
  objectOpenRecordIn: ObjectOpenRecordIn;
  openRecordInPreference: OpenRecordIn;
  canDisplaySidePanel: boolean;
};

export const resolveOpenRecordIn = ({
  objectOpenRecordIn,
  openRecordInPreference,
  canDisplaySidePanel,
}: ResolveOpenRecordInArgs): OpenRecordIn => {
  const requestedOpenRecordIn =
    objectOpenRecordIn === ObjectOpenRecordIn.USER_CHOICE
      ? openRecordInPreference
      : objectOpenRecordIn === ObjectOpenRecordIn.SIDE_PANEL
        ? OpenRecordIn.SIDE_PANEL
        : OpenRecordIn.RECORD_PAGE;

  return requestedOpenRecordIn === OpenRecordIn.SIDE_PANEL &&
    canDisplaySidePanel
    ? OpenRecordIn.SIDE_PANEL
    : OpenRecordIn.RECORD_PAGE;
};
