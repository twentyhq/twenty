import { SidePanelPages } from 'twenty-shared/types';

import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { useExpandAskAiSidePanelPage } from '@/side-panel/pages/ask-ai/hooks/useExpandAskAiSidePanelPage';
import { useExpandRecordSidePanelPage } from '@/side-panel/pages/record-page/hooks/useExpandRecordSidePanelPage';
import { useExpandRecordsSidePanelPage } from '@/side-panel/pages/records-page/hooks/useExpandRecordsSidePanelPage';
import { useExpandRichTextSidePanelPage } from '@/side-panel/pages/rich-text-page/hooks/useExpandRichTextSidePanelPage';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useSidePanelExpandTarget = (): SidePanelExpandTarget | null => {
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const { hasSidePanelSubPages } = useSidePanelSubPageHistory();

  const askAiExpandTarget = useExpandAskAiSidePanelPage();
  const recordExpandTarget = useExpandRecordSidePanelPage();
  const recordsExpandTarget = useExpandRecordsSidePanelPage();
  const richTextExpandTarget = useExpandRichTextSidePanelPage();

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
    case SidePanelPages.EditRichText:
      return richTextExpandTarget;
    default:
      return null;
  }
};
