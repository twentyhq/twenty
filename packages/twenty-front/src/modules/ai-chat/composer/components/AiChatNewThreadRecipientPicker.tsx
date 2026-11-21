import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { getWorkspaceMemberNameOrEmail } from 'twenty-shared/workspace';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Autocomplete } from 'twenty-ui/primitives/input';

import { AiChatChannelIcon } from '@/ai-chat/threads/components/AiChatChannelIcon';
import { AiChatAssistantAvatar } from '@/ai-chat/components/AiChatAssistantAvatar';
import { AI_CHAT_ASSISTANT_RECIPIENT_SUGGESTION_ID } from '@/ai-chat/composer/constants/AiChatAssistantRecipientSuggestionId';
import { useAiChatAssistantProfile } from '@/ai-chat/hooks/useAiChatAssistantProfile';
import { aiChatComposerNewThreadRecipientsFamilyState } from '@/ai-chat/states/composer/aiChatComposerNewThreadRecipientsFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { type AiChatChannel } from '@/ai-chat/threads/types/AiChatChannel';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { AutocompleteContent } from '@/ui/input/components/AutocompleteContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const RECIPIENT_PICKER_SIDE_OFFSET_PX = 6;
const SHOW_MORE_SUGGESTIONS_ROOT_MARGIN = '0px 0px 320px 0px';

const StyledShowMoreSuggestionsTrigger = styled.div`
  height: 1px;
`;

type AiChatNewThreadRecipientPickerProps = {
  isAssistantSuggested: boolean;
  suggestedWorkspaceMembers: PartialWorkspaceMember[];
  suggestedChannels: AiChatChannel[];
  hasMoreSuggestions: boolean;
  onShowMoreSuggestions: () => void;
  onPick: () => void;
};

export const AiChatNewThreadRecipientPicker = ({
  isAssistantSuggested,
  suggestedWorkspaceMembers,
  suggestedChannels,
  hasMoreSuggestions,
  onShowMoreSuggestions,
  onPick,
}: AiChatNewThreadRecipientPickerProps) => {
  const { t } = useLingui();
  const { displayName: assistantName } = useAiChatAssistantProfile();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const setAiChatComposerNewThreadRecipients = useSetAtomFamilyState(
    aiChatComposerNewThreadRecipientsFamilyState,
    newAiChatThreadId,
  );
  const [suggestionList, setSuggestionList] = useState<HTMLDivElement | null>(
    null,
  );
  const { ref: showMoreSuggestionsTriggerRef } = useInView({
    root: suggestionList,
    rootMargin: SHOW_MORE_SUGGESTIONS_ROOT_MARGIN,
    skip: !hasMoreSuggestions,
    onChange: (isInView) => {
      if (isInView) {
        onShowMoreSuggestions();
      }
    },
  });

  return (
    <AutocompleteContent
      align="start"
      sideOffset={RECIPIENT_PICKER_SIDE_OFFSET_PX}
      width={GenericDropdownContentWidth.ExtraLarge}
    >
      <Autocomplete.List
        ref={setSuggestionList}
        aria-label={t`Select recipients`}
      >
        {isAssistantSuggested && (
          <Autocomplete.Item
            value={AI_CHAT_ASSISTANT_RECIPIENT_SUGGESTION_ID}
            startIcon={<AiChatAssistantAvatar />}
            onClick={() => {
              setAiChatComposerNewThreadRecipients((current) => ({
                ...current,
                isAssistantParticipant: true,
              }));
              onPick();
            }}
          >
            {assistantName}
          </Autocomplete.Item>
        )}
        {suggestedWorkspaceMembers.map((workspaceMember) => {
          const label = getWorkspaceMemberNameOrEmail(workspaceMember);

          return (
            <Autocomplete.Item
              key={workspaceMember.id}
              value={workspaceMember.id}
              startIcon={
                <Avatar
                  name={label}
                  colorSeed={workspaceMember.id}
                  src={getAbsoluteImageUrl(workspaceMember.avatarUrl)}
                  size="sm"
                  shape="circle"
                />
              }
              description={workspaceMember.userEmail}
              onClick={() => {
                setAiChatComposerNewThreadRecipients((current) => ({
                  ...current,
                  recipientWorkspaceMemberIds: [
                    ...current.recipientWorkspaceMemberIds,
                    workspaceMember.id,
                  ],
                }));
                onPick();
              }}
            >
              {label}
            </Autocomplete.Item>
          );
        })}
        {suggestedChannels.map((channel) => (
          <Autocomplete.Item
            key={channel.id}
            value={channel.id}
            startIcon={<AiChatChannelIcon channel={channel} />}
            description={t`Channel`}
            onClick={() => {
              setAiChatComposerNewThreadRecipients((current) => ({
                ...current,
                channelId: channel.id,
              }));
              onPick();
            }}
          >
            {channel.name}
          </Autocomplete.Item>
        ))}
        {hasMoreSuggestions && (
          <StyledShowMoreSuggestionsTrigger
            ref={showMoreSuggestionsTriggerRef}
            aria-hidden
          />
        )}
      </Autocomplete.List>
      <Autocomplete.Empty>{t`No recipients found`}</Autocomplete.Empty>
    </AutocompleteContent>
  );
};
