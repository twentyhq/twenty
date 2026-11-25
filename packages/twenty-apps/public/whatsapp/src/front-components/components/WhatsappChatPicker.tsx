import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { LightButton, SearchInput } from 'twenty-ui/components/input';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { IconMessage, IconUser, IconUsers } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { WHATSAPP_CHAT_OPTIONS_PAGE_SIZE } from 'src/constants/whatsapp-chat-options-page-size.constant';
import { WHATSAPP_SELECTED_CHATS_MAX_COUNT } from 'src/constants/whatsapp-selected-chats-max-count.constant';
import { WhatsappChatPickerSkeleton } from 'src/front-components/components/WhatsappChatPickerSkeleton';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { fetchWhatsappChatOptions } from 'src/front-components/utils/fetch-whatsapp-chat-options.util';
import { filterWhatsappChatsByName } from 'src/front-components/utils/filter-whatsapp-chats-by-name.util';
import { getUnlistedSelectedWhatsappChats } from 'src/front-components/utils/get-unlisted-selected-whatsapp-chats.util';
import { loadMoreWhatsappChatOptions } from 'src/front-components/utils/load-more-whatsapp-chat-options.util';
import { toggleWhatsappChatSelection } from 'src/front-components/utils/toggle-whatsapp-chat-selection.util';
import { type WhatsappChatOption } from 'src/types/whatsapp-chat-option.type';
import { type WhatsappChatOptionsPage } from 'src/types/whatsapp-chat-options-page.type';
import { type WhatsappSelectedChat } from 'src/types/whatsapp-selected-chat.type';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing['0.5']};
  max-height: 320px;
  overflow-y: auto;
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-height: ${() => themeCssVariables.spacing[6]};
`;

type WhatsappChatPickerState =
  | { step: 'loading' }
  | { step: 'unavailable' }
  | { step: 'ready'; page: WhatsappChatOptionsPage };

const toSelectedChats = (chat: WhatsappChatOption): WhatsappSelectedChat[] =>
  chat.chatIds.map((id) => ({ id, name: chat.name }));

type WhatsappChatPickerProps = {
  selectedChats: WhatsappSelectedChat[];
  onChange: (selectedChats: WhatsappSelectedChat[]) => void;
};

export const WhatsappChatPicker = ({
  selectedChats,
  onChange,
}: WhatsappChatPickerProps) => {
  const [state, setState] = useState<WhatsappChatPickerState>({
    step: 'loading',
  });
  const [limit, setLimit] = useState(WHATSAPP_CHAT_OPTIONS_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState('');

  const loadFirstChats = async () => {
    try {
      setState({ step: 'ready', page: await fetchWhatsappChatOptions(limit) });
    } catch {
      setState({ step: 'unavailable' });
    }
  };

  const handleRetry = async () => {
    setState({ step: 'loading' });
    await loadFirstChats();
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);

    const requestedLimit = limit + WHATSAPP_CHAT_OPTIONS_PAGE_SIZE;
    const page = await loadMoreWhatsappChatOptions(requestedLimit);

    if (isDefined(page)) {
      setLimit(requestedLimit);
      setState({ step: 'ready', page });
    }

    setIsLoadingMore(false);
  };

  const visibleChats =
    state.step === 'ready'
      ? filterWhatsappChatsByName({ chats: state.page.chats, search })
      : [];
  const selectedChatIds = new Set(selectedChats.map((chat) => chat.id));
  const isChatSelected = (chat: WhatsappChatOption): boolean =>
    toSelectedChats(chat).some(({ id }) => selectedChatIds.has(id));
  const unlistedSelectedChats =
    state.step === 'ready'
      ? getUnlistedSelectedWhatsappChats({
          selectedChats,
          listedChatIds: state.page.chats.flatMap((chat) => chat.chatIds),
        })
      : [];
  const selectedConversationCount =
    state.step === 'ready'
      ? state.page.chats.filter(isChatSelected).length +
        unlistedSelectedChats.length
      : selectedChats.length;
  const visibleUnlistedSelectedChats = filterWhatsappChatsByName({
    chats: unlistedSelectedChats,
    search,
  });
  const isSelectionFull =
    selectedChats.length >= WHATSAPP_SELECTED_CHATS_MAX_COUNT;

  return (
    <StyledContainer>
      <OnMountEffect onMount={loadFirstChats} />
      <SearchInput
        aria-label={t('Search conversations')}
        placeholder={t('Search conversations')}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      {state.step === 'loading' && <WhatsappChatPickerSkeleton />}
      {state.step === 'unavailable' && (
        <InlineBanner
          layout="compact"
          status="error"
          fullWidth
          action={
            <InlineBanner.Action onClick={handleRetry}>
              {t('Retry')}
            </InlineBanner.Action>
          }
        >
          {t('Could not load your WhatsApp conversations.')}
        </InlineBanner>
      )}
      {state.step === 'ready' && (
        <>
          {visibleChats.length === 0 &&
          visibleUnlistedSelectedChats.length === 0 ? (
            <Text size="sm" color="tertiary">
              {t('No conversation found.')}
            </Text>
          ) : (
            <StyledList role="group" aria-label={t('Conversations')}>
              {visibleChats.map((chat) => {
                const isSelected = isChatSelected(chat);

                return (
                  <ListItemButton
                    key={chat.id}
                    role="checkbox"
                    aria-checked={isSelected}
                    indicator="checkbox"
                    selected={isSelected}
                    disabled={!isSelected && isSelectionFull}
                    startIcon={chat.isGroup ? <IconUsers /> : <IconUser />}
                    description={
                      isDefined(chat.lastMessageAt)
                        ? new Date(chat.lastMessageAt).toLocaleDateString(
                            undefined,
                            { day: 'numeric', month: 'short', year: 'numeric' },
                          )
                        : undefined
                    }
                    descriptionPlacement="end"
                    onClick={() =>
                      onChange(
                        toggleWhatsappChatSelection({
                          selectedChats,
                          chats: toSelectedChats(chat),
                        }),
                      )
                    }
                  >
                    {chat.name}
                  </ListItemButton>
                );
              })}
              {visibleUnlistedSelectedChats.map((chat) => (
                <ListItemButton
                  key={chat.id}
                  role="checkbox"
                  aria-checked
                  indicator="checkbox"
                  selected
                  startIcon={<IconMessage />}
                  description={t('Older conversation')}
                  descriptionPlacement="end"
                  onClick={() =>
                    onChange(
                      toggleWhatsappChatSelection({
                        selectedChats,
                        chats: [chat],
                      }),
                    )
                  }
                >
                  {isNonEmptyString(chat.name)
                    ? chat.name
                    : t('Conversation not listed above')}
                </ListItemButton>
              ))}
            </StyledList>
          )}
          <StyledFooter>
            <Text size="sm" color="tertiary" aria-live="polite">
              {isSelectionFull
                ? t('{count} selected, the most that can be imported', {
                    count: selectedConversationCount,
                  })
                : t('{count} selected', { count: selectedConversationCount })}
            </Text>
            {state.page.hasMore && (
              <LightButton
                size="sm"
                onClick={handleLoadMore}
                loading={isLoadingMore}
                disabled={isLoadingMore}
              >
                {t('Load more')}
              </LightButton>
            )}
          </StyledFooter>
        </>
      )}
    </StyledContainer>
  );
};
