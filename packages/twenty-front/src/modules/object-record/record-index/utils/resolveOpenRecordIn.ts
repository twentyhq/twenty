import { ObjectOpenRecordIn, OpenRecordIn } from 'twenty-shared/types';

type ResolveOpenRecordInArgs = {
  objectOpenRecordIn: ObjectOpenRecordIn;
  openRecordInPreference: OpenRecordIn;
  canDisplaySidePanel: boolean;
};

// The object either pins where its records open or hands the choice to the
// member, and the side panel is only a real destination when there is room to
// display it. Nothing else has a say, so a chip resolves the same way
// everywhere it renders.
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
