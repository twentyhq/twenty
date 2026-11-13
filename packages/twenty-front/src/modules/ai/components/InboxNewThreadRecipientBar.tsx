import { useLingui } from '@lingui/react/macro';
import { useId, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FormFieldRow, LightButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { useTheme } from 'twenty-ui/theme';

import { InboxChannelIcon } from '@/ai/components/InboxChannelIcon';
import { AiChatAssistantAvatar } from '@/ai/components/AiChatAssistantAvatar';
import { ChatRecipientChip } from '@/chat/components/ChatRecipientChip';
import { InboxNewThreadRecipientPicker } from '@/ai/components/InboxNewThreadRecipientPicker';
import { useAiChatAssistantProfile } from '@/ai/hooks/useAiChatAssistantProfile';
import { useIsOnNewInboxSlot } from '@/ai/hooks/useIsOnNewInboxSlot';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { inboxChannelsState } from '@/ai/states/inboxChannelsState';
import { inboxNewThreadChannelIdState } from '@/ai/states/inboxNewThreadChannelIdState';
import { inboxNewThreadRecipientsFamilyState } from '@/ai/states/inboxNewThreadRecipientsFamilyState';
import { inboxIsSendingMessageFamilyState } from '@/ai/states/inboxIsSendingMessageFamilyState';
import { newInboxThreadIdState } from '@/ai/states/newInboxThreadIdState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const InboxNewThreadRecipientBar = () => {
  const { t } = useLingui();
  const { displayName: assistantName } = useAiChatAssistantProfile();
  const theme = useTheme();
  const dropdownInstanceId = useId();
  const recipientRowRef = useRef<HTMLDivElement>(null);
  const addRecipientsButtonRef = useRef<HTMLButtonElement>(null);
  const isOnNewInboxSlot = useIsOnNewInboxSlot();
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const newInboxThreadId = useAtomStateValue(newInboxThreadIdState);
  const inboxIsSendingMessage = useAtomFamilyStateValue(
    inboxIsSendingMessageFamilyState,
    { threadId: newInboxThreadId },
  );
  const [recipients, setRecipients] = useAtomFamilyState(
    inboxNewThreadRecipientsFamilyState,
    newInboxThreadId,
  );
  const [inboxNewThreadChannelId, setInboxNewThreadChannelId] = useAtomState(
    inboxNewThreadChannelIdState,
  );
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const channel = useAtomStateValue(inboxChannelsState)?.find(
    ({ id }) => id === inboxNewThreadChannelId,
  );
  const recipientWorkspaceMembers = currentWorkspaceMembers.filter(({ id }) =>
    recipients.recipientWorkspaceMemberIds.includes(id),
  );

  const isCreatingChat = isOnNewInboxSlot || !isDefined(currentInboxThread);

  if (
    !isAiChatInboxEnabled ||
    !isCreatingChat ||
    isWorkspaceSetupChat ||
    inboxIsSendingMessage
  ) {
    return null;
  }

  const focusAddRecipientsButton = () => {
    addRecipientsButtonRef.current?.focus();
  };

  return (
    <FormFieldRow
      ref={recipientRowRef}
      aria-label={t`Recipients`}
      contentPaddingInline={0}
    >
      {recipients.isAssistantParticipant && (
        <ChatRecipientChip
          label={assistantName}
          avatar={<AiChatAssistantAvatar />}
          onRemove={() => {
            focusAddRecipientsButton();
            setRecipients((current) => ({
              ...current,
              isAssistantParticipant: false,
            }));
          }}
        />
      )}
      {recipientWorkspaceMembers.map((workspaceMember) => {
        const label = getWorkspaceMemberNameOrEmail(workspaceMember);

        return (
          <ChatRecipientChip
            key={workspaceMember.id}
            label={label}
            avatar={
              <Avatar
                name={label}
                colorSeed={workspaceMember.id}
                src={getAbsoluteImageUrl(workspaceMember.avatarUrl)}
                size="sm"
                shape="circle"
              />
            }
            onRemove={() => {
              focusAddRecipientsButton();
              setRecipients((current) => ({
                ...current,
                recipientWorkspaceMemberIds:
                  current.recipientWorkspaceMemberIds.filter(
                    (recipientId) => recipientId !== workspaceMember.id,
                  ),
              }));
            }}
          />
        );
      })}
      {isDefined(channel) && (
        <ChatRecipientChip
          label={channel.name}
          avatar={
            <InboxChannelIcon channel={channel} size={theme.icon.size.sm} />
          }
          onRemove={() => {
            focusAddRecipientsButton();
            setInboxNewThreadChannelId(null);
          }}
        />
      )}
      <DropdownRoot
        dropdownId={`ai-chat-new-thread-recipients-${dropdownInstanceId}`}
        type="picker"
        multiple
      >
        <Dropdown.Trigger
          render={
            <LightButton
              ref={addRecipientsButtonRef}
              emphasis="subtle"
              size="sm"
            >
              {t`Add people or a channel`}
            </LightButton>
          }
        />
        <DropdownContent
          anchor={recipientRowRef}
          width={GenericDropdownContentWidth.ExtraLarge}
          aria-label={t`Select recipients`}
        >
          <InboxNewThreadRecipientPicker />
        </DropdownContent>
      </DropdownRoot>
    </FormFieldRow>
  );
};
