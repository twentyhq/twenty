import { SidePanelPages } from 'twenty-shared/types';

import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { useExpandAskAiSidePanelPage } from '@/side-panel/pages/ask-ai/hooks/useExpandAskAiSidePanelPage';
import { useExpandRecordSidePanelPage } from '@/side-panel/pages/record-page/hooks/useExpandRecordSidePanelPage';
import { useExpandRecordsSidePanelPage } from '@/side-panel/pages/records-page/hooks/useExpandRecordsSidePanelPage';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Pages that have no full page equivalent return null and get no expand button.
export const useSidePanelExpandTarget = (): SidePanelExpandTarget | null => {
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const { hasSidePanelSubPages } = useSidePanelSubPageHistory();

  const askAiExpandTarget = useExpandAskAiSidePanelPage();
  const recordExpandTarget = useExpandRecordSidePanelPage();
  const recordsExpandTarget = useExpandRecordsSidePanelPage();

  // A sub page has taken over the panel content, so expanding the page
  // underneath it would discard what the user is currently doing.
  if (hasSidePanelSubPages) {
    return null;
  }

  switch (sidePanelPage) {
    case SidePanelPages.AskAI:
      return askAiExpandTarget;
    case SidePanelPages.ViewRecord:
      return recordExpandTarget;
    case SidePanelPages.ViewRecords:
      return recordsExpandTarget;
    default:
      return null;
  }
};
