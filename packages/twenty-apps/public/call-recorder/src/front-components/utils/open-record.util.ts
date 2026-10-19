import { openSidePanelPage, SidePanelPages } from 'twenty-sdk/front-component';

// ViewRecord follows the object's "open record in" setting, like native chips.
export const openRecord = ({
  objectNameSingular,
  recordId,
}: {
  objectNameSingular: string;
  recordId: string;
}): Promise<void> =>
  openSidePanelPage({
    page: SidePanelPages.ViewRecord,
    objectNameSingular,
    recordId,
  });
