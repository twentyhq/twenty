import { useMessageThreadChannel } from '@/activities/emails/hooks/useMessageThreadChannel';
import { isChatTimelineThreadChannel } from '@/activities/emails/utils/isChatTimelineThreadChannel';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { StandardObjectNameSingular } from 'twenty-shared/types';

export const useDisplaySidePanelFooter = ({
  id,
  targetObjectNameSingular,
}: TargetRecordIdentifier) => {
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  const isMessageThread =
    targetObjectNameSingular === StandardObjectNameSingular.MessageThread;

  const { messageThreadChannel, messageThreadChannelLoading } =
    useMessageThreadChannel(id, { skip: !isInSidePanel || !isMessageThread });

  if (!isInSidePanel) {
    return false;
  }

  if (!isMessageThread) {
    return true;
  }

  return (
    !messageThreadChannelLoading &&
    !isChatTimelineThreadChannel(messageThreadChannel)
  );
};
