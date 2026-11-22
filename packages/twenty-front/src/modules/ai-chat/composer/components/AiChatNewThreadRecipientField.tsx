import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, useId, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { getWorkspaceMemberNameOrEmail } from 'twenty-shared/workspace';
import { FormFieldRow } from 'twenty-ui/components/input';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Autocomplete, Input } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AiChatChannelIcon } from '@/ai-chat/threads/components/AiChatChannelIcon';
import { AiChatAssistantAvatar } from '@/ai-chat/components/AiChatAssistantAvatar';
import { ChatRecipientChip } from '@/chat/components/ChatRecipientChip';
import { AiChatNewThreadRecipientPicker } from '@/ai-chat/composer/components/AiChatNewThreadRecipientPicker';
import { useAiChatAssistantProfile } from '@/ai-chat/hooks/useAiChatAssistantProfile';
import { useAiChatNewThreadRecipientSuggestions } from '@/ai-chat/composer/hooks/useAiChatNewThreadRecipientSuggestions';
import { aiChatChannelFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatChannelFamilySelector';
import { aiChatComposerNewThreadRecipientsFamilyState } from '@/ai-chat/composer/states/aiChatComposerNewThreadRecipientsFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { AutocompleteRoot } from '@/ui/input/components/AutocompleteRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { useRemoveFocusItemFromFocusStackOnUnmount } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackOnUnmount';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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

export const AiChatNewThreadRecipientField = () => {
  const { t } = useLingui();
  const { displayName: assistantName } = useAiChatAssistantProfile();
  const theme = useTheme();
  const instanceId = useId();
  const suggestionsDropdownId = `ai-chat-new-thread-recipients-${instanceId}`;
  const addRecipientsInputFocusId = `${suggestionsDropdownId}-input`;
  const addRecipientsInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [searchWhenSuggestionsClosed, setSearchWhenSuggestionsClosed] =
    useState('');
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    suggestionsDropdownId,
  );
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const [recipients, setRecipients] = useAtomFamilyState(
    aiChatComposerNewThreadRecipientsFamilyState,
    newAiChatThreadId,
  );
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const aiChatChannel = useAtomFamilySelectorValue(
    aiChatChannelFamilySelector,
    recipients.channelId,
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
    resetVisibleSuggestionCount,
  } = useAiChatNewThreadRecipientSuggestions({
    search: isDropdownOpen ? search : searchWhenSuggestionsClosed,
  });

  useRemoveFocusItemFromFocusStackOnUnmount({
    focusId: addRecipientsInputFocusId,
    isEnabled: true,
  });

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

  const handleSuggestionsClose = () => {
    setSearchWhenSuggestionsClosed(search);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    resetVisibleSuggestionCount();
  };

  const handleAddRecipientsInputBlur = () => {
    removeFocusItemFromFocusStackById({ focusId: addRecipientsInputFocusId });
    handleSuggestionsClose();
    closeDropdown(suggestionsDropdownId);
    setSearch('');
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
      openOnInputClick
      onValueChange={handleSearchChange}
      onClose={handleSuggestionsClose}
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
          {isDefined(aiChatChannel) && (
            <ChatRecipientChip
              label={aiChatChannel.name}
              avatar={
                <AiChatChannelIcon
                  channel={aiChatChannel}
                  size={theme.icon.size.sm}
                />
              }
              onRemove={() => {
                focusAddRecipientsInput();
                setRecipients((current) => ({ ...current, channelId: null }));
              }}
            />
          )}
          <StyledAddRecipientsContainer onMouseDown={handleRecipientsMouseDown}>
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
