import { useContext } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

import { INBOX_SURFACE } from '@/ai/constants/InboxSurface';
import { InboxSurfaceContext } from '@/ai/contexts/InboxSurfaceContext';

export const useHasInboxThreadPageContentInset = () => {
  const inboxSurface = useContext(InboxSurfaceContext);
  const isMobile = useIsMobile();

  return inboxSurface === INBOX_SURFACE.PAGE && !isMobile;
};
