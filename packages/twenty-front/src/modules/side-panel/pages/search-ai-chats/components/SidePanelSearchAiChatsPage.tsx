import { useLocation } from 'react-router-dom';

import { SidePanelAiChatPicker } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPicker';

export const SidePanelSearchAiChatsPage = () => {
  const { key } = useLocation();

  return <SidePanelAiChatPicker key={key} />;
};
