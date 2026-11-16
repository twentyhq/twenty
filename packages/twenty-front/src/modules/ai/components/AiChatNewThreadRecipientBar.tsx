import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  type FormEvent,
  type MouseEvent,
  useId,
  useRef,
  useState,
} from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FormFieldRow } from 'twenty-ui/components/input';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Autocomplete, Input } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AiChatChannelIcon } from '@/ai/components/AiChatChannelIcon';
import { AiChatAssistantAvatar } from '@/ai/components/AiChatAssistantAvatar';
import { ChatRecipientChip } from '@/chat/components/ChatRecipientChip';
import { AiChatNewThreadRecipientPicker } from '@/ai/components/AiChatNewThreadRecipientPicker';
import { useAiChatAssistantProfile } from '@/ai/hooks/useAiChatAssistantProfile';
import { useAiChatNewThreadRecipientSuggestions } from '@/ai/hooks/useAiChatNewThreadRecipientSuggestions';
import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { aiChatChannelsState } from '@/ai/states/aiChatChannelsState';
import { aiChatNewThreadChannelIdState } from '@/ai/states/aiChatNewThreadChannelIdState';
import { aiChatNewThreadRecipientsFamilyState } from '@/ai/states/aiChatNewThreadRecipientsFamilyState';
import { aiChatIsSendingMessageFamilyState } from '@/ai/states/aiChatIsSendingMessageFamilyState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { AutocompleteRoot } from '@/ui/input/components/AutocompleteRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const ADD_RECIPIENTS_INPUT_MIN_WIDTH_PX = 80;

const StyledRecipients = styled.div`
  align-items: center;
  cursor: text;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledAddRecipientsContainer = styled.div`
  cursor: text;
  display: flex;
  flex: 1 0 ${ADD_RECIPIENTS_INPUT_MIN_WIDTH_PX}px;
  min-height: ${themeCssVariables.spacing[8]};
  min-width: 0;
  padding-inline: ${themeCssVariables.spacing[2]};
`;

export const AiChatNewThreadRecipientBar = () => {
  const { t } = useLingui();
  const { displayName: assistantName } = useAiChatAssistantProfile();
  const theme = useTheme();
  const instanceId = useId();
  const suggestionsDropdownId = `ai-chat-new-thread-recipients-${instanceId}`;
  const addRecipientsInputFocusId = `${suggestionsDropdownId}-input`;
  const addRecipientsInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    suggestionsDropdownId,
  );
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();
  const isOnNewAiChatSlot = useIsOnNewAiChatSlot();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const aiChatIsSendingMessage = useAtomFamilyStateValue(
    aiChatIsSendingMessageFamilyState,
    { threadId: newAiChatThreadId },
  );
  const [recipients, setRecipients] = useAtomFamilyState(
    aiChatNewThreadRecipientsFamilyState,
    newAiChatThreadId,
  );
  const [aiChatNewThreadChannelId, setAiChatNewThreadChannelId] = useAtomState(
    aiChatNewThreadChannelIdState,
  );
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const channel = useAtomStateValue(aiChatChannelsState)?.find(
    ({ id }) => id === aiChatNewThreadChannelId,
  );
  const recipientWorkspaceMembers = currentWorkspaceMembers.filter(({ id }) =>
    recipients.recipientWorkspaceMemberIds.includes(id),
  );
  const {
    isAssistantSuggested,
    suggestedWorkspaceMembers,
    suggestedChannels,
    suggestionIds,
    hasMoreSuggestions,
    showMoreSuggestions,
  } = useAiChatNewThreadRecipientSuggestions({ search, isDropdownOpen });

  const isCreatingChat = isOnNewAiChatSlot || !isDefined(currentAiChatThread);

  if (
    !isAiChatInboxEnabled ||
    !isCreatingChat ||
    isWorkspaceSetupChat ||
    aiChatIsSendingMessage
  ) {
    return null;
  }

  const focusAddRecipientsInput = () => {
    addRecipientsInputRef.current?.focus();
  };

  const openSuggestions = () => {
    openDropdown({
      dropdownComponentInstanceIdFromProps: suggestionsDropdownId,
    });
  };

  const handleAddRecipientsInputFocus = () => {
    pushFocusItemToFocusStack({
      focusId: addRecipientsInputFocusId,
      component: {
        type: FocusComponentType.TEXT_INPUT,
        instanceId: addRecipientsInputFocusId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const handleAddRecipientsInputBlur = () => {
    removeFocusItemFromFocusStackById({ focusId: addRecipientsInputFocusId });
    closeDropdown(suggestionsDropdownId);
    setSearch('');
  };

  const handleAddRecipientsContainerChange = (
    event: FormEvent<HTMLDivElement>,
  ) => {
    if (event.target instanceof HTMLInputElement && event.target.value === '') {
      openSuggestions();
    }
  };

  const handleRecipientsMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    event.preventDefault();
    focusAddRecipientsInput();
    openSuggestions();
  };

  return (
    <AutocompleteRoot
      dropdownId={suggestionsDropdownId}
      items={suggestionIds}
      value={search}
      onValueChange={setSearch}
    >
      <FormFieldRow aria-label={t`Recipients`} contentPaddingInline={0}>
        <Autocomplete.InputGroup
          render={<StyledRecipients onMouseDown={handleRecipientsMouseDown} />}
        >
          {recipients.isAssistantParticipant && (
            <ChatRecipientChip
              label={assistantName}
              avatar={<AiChatAssistantAvatar size={14} />}
              onRemove={() => {
                focusAddRecipientsInput();
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
                  focusAddRecipientsInput();
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
                <AiChatChannelIcon
                  channel={channel}
                  size={theme.icon.size.sm}
                />
              }
              onRemove={() => {
                focusAddRecipientsInput();
                setAiChatNewThreadChannelId(null);
              }}
            />
          )}
          <StyledAddRecipientsContainer
            onMouseDown={handleRecipientsMouseDown}
            onChange={handleAddRecipientsContainerChange}
          >
            <Autocomplete.Input
              ref={addRecipientsInputRef}
              type="text"
              autoComplete="off"
              spellCheck={false}
              aria-label={t`Add people or a channel`}
              placeholder={t`Add people or a channel`}
              render={<Input variant="plain" hasFocusRing={false} />}
              onFocus={handleAddRecipientsInputFocus}
              onBlur={handleAddRecipientsInputBlur}
              onClick={openSuggestions}
            />
          </StyledAddRecipientsContainer>
        </Autocomplete.InputGroup>
      </FormFieldRow>
      <AiChatNewThreadRecipientPicker
        isAssistantSuggested={isAssistantSuggested}
        suggestedWorkspaceMembers={suggestedWorkspaceMembers}
        suggestedChannels={suggestedChannels}
        hasMoreSuggestions={hasMoreSuggestions}
        onShowMoreSuggestions={showMoreSuggestions}
        onPick={() => setSearch('')}
      />
    </AutocompleteRoot>
  );
};
