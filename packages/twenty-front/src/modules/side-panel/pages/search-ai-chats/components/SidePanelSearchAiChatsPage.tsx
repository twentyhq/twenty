import { useLocation } from 'react-router-dom';

import { SidePanelSearchAiChatsContent } from '@/side-panel/pages/search-ai-chats/components/SidePanelSearchAiChatsContent';

export const SidePanelSearchAiChatsPage = () => {
  const { key } = useLocation();

  return <SidePanelSearchAiChatsContent key={key} />;
};
