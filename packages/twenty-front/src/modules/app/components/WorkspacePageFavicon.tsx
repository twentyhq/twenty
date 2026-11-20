import { PageFavicon } from '@/app/components/PageFavicon';
import { useInboxOpenThreadsSummary } from '@/inbox/hooks/useInboxOpenThreadsSummary';

export const WorkspacePageFavicon = () => {
  const { hasUnreadOpenThread } = useInboxOpenThreadsSummary();

  return <PageFavicon hasUnreadDot={hasUnreadOpenThread} />;
};
