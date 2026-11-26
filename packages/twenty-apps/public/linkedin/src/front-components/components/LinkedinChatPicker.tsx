import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { enqueueSnackbar, t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { LightButton, SearchInput } from 'twenty-ui/components/input';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { IconMessage, IconUser, IconUsers } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { LINKEDIN_CHAT_OPTIONS_PAGE_SIZE } from 'src/constants/linkedin-chat-options-page-size.constant';
import { LINKEDIN_SELECTED_CHATS_MAX_COUNT } from 'src/constants/linkedin-selected-chats-max-count.constant';
import { LinkedinChatPickerSkeleton } from 'src/front-components/components/LinkedinChatPickerSkeleton';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { fetchLinkedinChatOptions } from 'src/front-components/utils/fetch-linkedin-chat-options.util';
import { getUnlistedSelectedLinkedinChats } from 'src/front-components/utils/get-unlisted-selected-linkedin-chats.util';
import { toggleLinkedinChatSelection } from 'src/front-components/utils/toggle-linkedin-chat-selection.util';
import { type LinkedinChatOptionsPage } from 'src/types/linkedin-chat-options-page.type';
import { type LinkedinSelectedChat } from 'src/types/linkedin-selected-chat.type';

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

type LinkedinChatPickerState =
  | { step: 'loading' }
  | { step: 'unavailable' }
  | { step: 'ready'; page: LinkedinChatOptionsPage };

type LinkedinChatPickerProps = {
  selectedChats: LinkedinSelectedChat[];
  onChange: (selectedChats: LinkedinSelectedChat[]) => void;
};

export const LinkedinChatPicker = ({
  selectedChats,
  onChange,
}: LinkedinChatPickerProps) => {
  const [state, setState] = useState<LinkedinChatPickerState>({
    step: 'loading',
  });
  const [limit, setLimit] = useState(LINKEDIN_CHAT_OPTIONS_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState('');

  const loadChatsOrThrow = async (requestedLimit: number) => {
    const page = await fetchLinkedinChatOptions(requestedLimit);

    setLimit(requestedLimit);
    setState({ step: 'ready', page });
  };

  const loadFirstChats = async () => {
    try {
      await loadChatsOrThrow(limit);
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

    try {
      await loadChatsOrThrow(limit + LINKEDIN_CHAT_OPTIONS_PAGE_SIZE);
    } catch {
      enqueueSnackbar({
        message: t('Could not load more LinkedIn conversations.'),
        variant: 'error',
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const visibleChats =
    state.step === 'ready'
      ? state.page.chats.filter((chat) =>
          chat.name.toLowerCase().includes(normalizedSearch),
        )
      : [];
  const selectedChatIds = new Set(selectedChats.map((chat) => chat.id));
  const visibleUnlistedSelectedChats =
    state.step === 'ready'
      ? getUnlistedSelectedLinkedinChats({
          selectedChats,
          listedChatIds: state.page.chats.map((chat) => chat.id),
        }).filter((chat) => chat.name.toLowerCase().includes(normalizedSearch))
      : [];
  const isSelectionFull =
    selectedChats.length >= LINKEDIN_SELECTED_CHATS_MAX_COUNT;

  return (
    <StyledContainer>
      <OnMountEffect onMount={loadFirstChats} />
      <SearchInput
        aria-label={t('Search conversations')}
        placeholder={t('Search conversations')}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      {state.step === 'loading' && <LinkedinChatPickerSkeleton />}
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
          {t('Could not load your LinkedIn conversations.')}
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
                const isSelected = selectedChatIds.has(chat.id);

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
                        toggleLinkedinChatSelection({
                          selectedChats,
                          chat: { id: chat.id, name: chat.name },
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
                      toggleLinkedinChatSelection({ selectedChats, chat }),
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
                    count: selectedChats.length,
                  })
                : t('{count} selected', { count: selectedChats.length })}
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
