import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { type KeyboardEvent, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { FormFieldRow, IconButton } from 'twenty-ui/components/input';
import { IconArrowUp, IconUsers } from 'twenty-ui/icon';
import { Avatar, Chip } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';
import { v4 } from 'uuid';

import { useStartAppChannelConversation } from '@/activities/emails/hooks/useStartAppChannelConversation';
import { StyledChatComposerBox } from '@/chat/components/StyledChatComposerBox';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { startAppConversationIdempotencyKeyComponentState } from '@/side-panel/pages/start-app-conversation/states/startAppConversationIdempotencyKeyComponentState';
import { startAppConversationTargetComponentState } from '@/side-panel/pages/start-app-conversation/states/startAppConversationTargetComponentState';
import { startAppConversationTextComponentState } from '@/side-panel/pages/start-app-conversation/states/startAppConversationTextComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const RECIPIENT_MAX_WIDTH = 240;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledBody = styled.div`
  flex: 1;
  min-height: 0;
`;

const StyledComposer = styled.div`
  flex-shrink: 0;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledTextarea = styled(TextareaAutosize)`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  outline: none;
  padding: 0;
  resize: none;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }
`;

const StyledActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const SidePanelStartAppConversationPage = () => {
  const { t } = useLingui();
  const store = useStore();
  const sidePanelPageId = useAvailableComponentInstanceIdOrThrow(
    SidePanelPageComponentInstanceContext,
  );
  const startAppConversationTarget = useAtomComponentStateValue(
    startAppConversationTargetComponentState,
  );
  const recordStore = useAtomFamilyStateValue(
    recordStoreFamilyState,
    startAppConversationTarget?.personId ?? '',
  );
  const { goBackFromSidePanel } = useSidePanelHistory();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { enqueueToast } = useToast();
  const { startAppChannelConversation, loading } =
    useStartAppChannelConversation();
  const [startAppConversationText, setStartAppConversationText] =
    useAtomComponentState(startAppConversationTextComponentState);
  const [
    startAppConversationIdempotencyKey,
    setStartAppConversationIdempotencyKey,
  ] = useAtomComponentState(startAppConversationIdempotencyKeyComponentState);

  const canSend = isNonEmptyString(startAppConversationText.trim()) && !loading;

  const handleSend = useCallback(async () => {
    if (!isDefined(startAppConversationTarget) || !canSend) {
      return;
    }

    const sendIdempotencyKey = startAppConversationIdempotencyKey ?? v4();

    setStartAppConversationIdempotencyKey(sendIdempotencyKey);

    try {
      const messageThreadId = await startAppChannelConversation({
        messageChannelId: startAppConversationTarget.messageChannelId,
        personId: startAppConversationTarget.personId,
        text: startAppConversationText.trim(),
        idempotencyKey: sendIdempotencyKey,
      });

      const isComposerStillActive =
        store.get(isSidePanelOpenedState.atom) &&
        store.get(sidePanelNavigationStackState.atom).at(-1)?.pageId ===
          sidePanelPageId;

      if (!isComposerStillActive) {
        return;
      }

      if (!isDefined(messageThreadId)) {
        goBackFromSidePanel();

        return;
      }

      openRecordInSidePanel({
        recordId: messageThreadId,
        objectNameSingular: StandardObjectNameSingular.MessageThread,
        resetNavigationStack: true,
      });
    } catch {
      enqueueToast({
        status: 'error',
        children: t`Could not start the conversation`,
      });
    }
  }, [
    startAppConversationTarget,
    canSend,
    startAppChannelConversation,
    startAppConversationText,
    startAppConversationIdempotencyKey,
    setStartAppConversationIdempotencyKey,
    store,
    sidePanelPageId,
    goBackFromSidePanel,
    openRecordInSidePanel,
    enqueueToast,
    t,
  ]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  if (!isDefined(startAppConversationTarget)) {
    return null;
  }

  const recipientName = recordStore?.name?.firstName ?? '';
  const recipientFullName =
    `${recipientName} ${recordStore?.name?.lastName ?? ''}`.trim();

  return (
    <StyledContainer>
      {isNonEmptyString(recipientFullName) && (
        <FormFieldRow
          aria-label={t`Recipients`}
          startIcon={<IconUsers size={themeCssVariables.icon.size.md} />}
          hasDivider
        >
          <Chip
            size="sm"
            variant="soft"
            maxWidth={RECIPIENT_MAX_WIDTH}
            startElement={
              <Avatar
                name={recipientFullName}
                colorSeed={startAppConversationTarget.personId}
                src={recordStore?.avatarUrl}
                size="sm"
                shape="circle"
              />
            }
          >
            {recipientFullName}
          </Chip>
        </FormFieldRow>
      )}
      <StyledBody />
      <StyledComposer>
        <StyledChatComposerBox>
          <StyledTextarea
            aria-label={t`Message`}
            placeholder={
              isNonEmptyString(recipientName)
                ? t`Message ${recipientName}`
                : t`Write a message`
            }
            minRows={1}
            maxRows={8}
            value={startAppConversationText}
            disabled={loading}
            onChange={(event) => {
              setStartAppConversationText(event.target.value);
              setStartAppConversationIdempotencyKey(null);
            }}
            onKeyDown={handleKeyDown}
          />
          <StyledActions>
            <IconButton
              variant="solid"
              color="accent"
              shape="round"
              size="sm"
              aria-label={t`Send`}
              disabled={!canSend}
              onClick={handleSend}
            >
              <IconArrowUp />
            </IconButton>
          </StyledActions>
        </StyledChatComposerBox>
      </StyledComposer>
    </StyledContainer>
  );
};
