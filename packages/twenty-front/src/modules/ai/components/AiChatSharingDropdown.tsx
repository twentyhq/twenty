import { useLingui } from '@lingui/react/macro';
import { IconShare } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { AiChatSharingRefreshEffect } from '@/ai/components/AiChatSharingRefreshEffect';
import { AiChatSharingDropdownContent } from '@/ai/components/AiChatSharingDropdownContent';
import { useChatThreadSharing } from '@/ai/hooks/useChatThreadSharing';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type AiChatSharingDropdownProps = { threadId: string };

export const AiChatSharingDropdown = ({
  threadId,
}: AiChatSharingDropdownProps) => {
  const { t } = useLingui();
  const dropdownId = `chat-sharing-${threadId}`;
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const sharingState = useChatThreadSharing(threadId, isDropdownOpen);

  return (
    <>
      <AiChatSharingRefreshEffect refetch={sharingState.refetch} />
      {sharingState.sharing?.isEnabled === true && (
        <Dropdown
          dropdownId={dropdownId}
          onOpen={() => {
            void sharingState.refetch().catch(() => {});
          }}
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
      )}
    </>
  );
};
