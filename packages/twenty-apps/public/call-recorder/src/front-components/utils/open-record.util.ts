import { openSidePanelPage, SidePanelPages } from 'twenty-sdk/front-component';

// The host resolves ViewRecord against the object's "open record in" setting
// and falls back to the record page on mobile, as Twenty's own chips do; a
// routed RecordShowPage would always force one or the other.
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
