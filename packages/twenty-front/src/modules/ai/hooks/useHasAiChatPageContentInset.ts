import { useContext } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

import { INBOX_SURFACE } from '@/ai/constants/AiChatSurface';
import { InboxSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';

export const useHasInboxThreadPageContentInset = () => {
  const inboxSurface = useContext(InboxSurfaceContext);
  const isMobile = useIsMobile();

  return inboxSurface === INBOX_SURFACE.PAGE && !isMobile;
};
