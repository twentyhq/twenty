import { useLingui } from '@lingui/react/macro';
import { IconShare } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { AiChatSharingDropdownContent } from '@/ai/components/AiChatSharingDropdownContent';
import { useChatThreadSharing } from '@/ai/hooks/useChatThreadSharing';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

type AiChatSharingDropdownProps = { threadId: string };

export const AiChatSharingDropdown = ({
  threadId,
}: AiChatSharingDropdownProps) => {
  const { t } = useLingui();
  const sharingState = useChatThreadSharing(threadId);

  if (sharingState.error || sharingState.sharing?.isEnabled !== true) {
    return null;
  }

  return (
    <Dropdown
      dropdownId={`chat-sharing-${threadId}`}
      dropdownPlacement="bottom-end"
      clickableComponent={
        <Button
          size="sm"
          variant="outline"
          startIcon={<IconShare />}
        >{t`Share`}</Button>
      }
      dropdownComponents={
        <AiChatSharingDropdownContent
          threadId={threadId}
          sharingState={sharingState}
        />
      }
    />
  );
};
