import { useCurrentInboxThreadAccess } from '@/ai/hooks/useCurrentInboxThreadAccess';
import { StyledInboxContentContainer } from '@/ai/components/StyledInboxContentContainer';
import { useState } from 'react';

import { styled } from '@linaria/react';
import { EditorContent } from '@tiptap/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

import { InboxComposerQuote } from '@/ai/components/InboxComposerQuote';
import { StyledChatComposerBox } from '@/chat/components/StyledChatComposerBox';
import { InboxInlineBanner } from '@/ai/components/InboxInlineBanner';
import { InboxEmptyState } from '@/ai/components/InboxEmptyState';
import { InboxParticipantMentionBar } from '@/ai/components/InboxParticipantMentionBar';
import { AiChatPendingAskGate } from '@/ai/components/AiChatPendingAskGate';
import { InboxNoMoreBillingCreditsBanner } from '@/ai/components/InboxNoMoreBillingCreditsBanner';
import { AiChatUsageLimitReachedBanner } from '@/ai/components/AiChatUsageLimitReachedBanner';
import { AiChatUserCreditsExhaustedBanner } from '@/ai/components/AiChatUserCreditsExhaustedBanner';
import { InboxStandaloneError } from '@/ai/components/InboxStandaloneError';
import { AgentChatContextPreview } from '@/ai/components/internal/AgentChatContextPreview';
import { InboxAddMenu } from '@/ai/components/InboxAddMenu';
import { InboxDictationButton } from '@/ai/dictation/components/InboxDictationButton';
import { InboxDictationEffect } from '@/ai/dictation/components/InboxDictationEffect';
import { InboxDictationHint } from '@/ai/dictation/components/InboxDictationHint';
import { InboxComposerActionsRow } from '@/ai/components/internal/InboxComposerActionsRow';
import { AiChatContextUsageButton } from '@/ai/components/internal/AiChatContextUsageButton';
import { InboxEditorFocusEffect } from '@/ai/components/internal/InboxEditorFocusEffect';
import { AiChatSentMessageHandOffEffect } from '@/ai/components/internal/AiChatSentMessageHandOffEffect';
import { SendMessageButton } from '@/ai/components/internal/SendMessageButton';
import { useInboxEditor } from '@/ai/hooks/useInboxEditor';
import { useInsertDictatedText } from '@/ai/dictation/hooks/useInsertDictatedText';
import { INBOX_THREAD_PAGE_CONTENT_INLINE_PADDING } from '@/ai/constants/InboxThreadPageContentInlinePadding';
import { useHasInboxThreadPageContentInset } from '@/ai/hooks/useHasInboxThreadPageContentInset';
import { useIsInboxComposerCentered } from '@/ai/hooks/useIsInboxComposerCentered';
import { useHasReachedAiChatCreditsCap } from '@/ai/hooks/useHasReachedAiChatCreditsCap';
import { useHasReachedAiChatUsageLimit } from '@/ai/hooks/useHasReachedAiChatUsageLimit';
import { inboxHasMessageSelector } from '@/ai/states/selectors/inboxHasMessageSelector';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useIsMobile } from 'twenty-ui/utilities';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCanSendInboxMessage } from '@/ai/hooks/useCanSendInboxMessage';
import { inboxThreadIsDirectMessageFamilySelector } from '@/ai/states/selectors/inboxThreadIsDirectMessageFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';

const StyledInputArea = styled(StyledInboxContentContainer)<{
  isMobile: boolean;
  isCentered?: boolean;
  hasPageContentInset: boolean;
}>`
  align-items: flex-end;
  background: ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: auto;
  padding-block: ${({ isMobile, isCentered }) => {
    if (isMobile) {
      return '0';
    }

    return isCentered
      ? themeCssVariables.spacing[3]
      : themeCssVariables.spacing[2];
  }};
  padding-inline: ${({ isCentered, hasPageContentInset }) =>
    hasPageContentInset && !isCentered
      ? INBOX_THREAD_PAGE_CONTENT_INLINE_PADDING
      : themeCssVariables.spacing[4]};
`;

const StyledInputBox = styled(StyledChatComposerBox)<{ isMobile: boolean }>`
  min-height: ${({ isMobile }) =>
    isMobile ? 'auto' : themeCssVariables.spacing[20]};
`;

const StyledEditorWrapper = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  .tiptap {
    background: transparent;
    border: none;
    box-shadow: none;
    color: ${themeCssVariables.font.color.primary};
    cursor: text;
    font-family: inherit;
    font-size: ${themeCssVariables.font.size.md};
    font-weight: ${themeCssVariables.font.weight.regular};
    line-height: 16px;
    max-height: ${({ isMobile }) => (isMobile ? '160px' : '320px')};
    min-height: ${({ isMobile }) =>
      isMobile ? 'auto' : themeCssVariables.spacing[6]};
    outline: none;
    overflow-y: auto;
    padding: 0;

    p {
      margin: 0;
    }

    p.is-editor-empty:first-of-type::before {
      color: ${themeCssVariables.font.color.light};
      content: attr(data-placeholder);
      float: left;
      font-weight: ${themeCssVariables.font.weight.regular};
      height: 0;
      pointer-events: none;
    }
  }
`;

const StyledMessageListPlaceholder = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledComposerBottomSpacer = styled.div`
  flex-basis: 0;
  flex-grow: 0;
  flex-shrink: 0;
  transition-duration: calc(
    ${themeCssVariables.animation.duration.normal} * 1s
  );
  transition-property: flex-grow;
  transition-timing-function: ease-out;

  // Only the collapse animates: re-centering on a thread switch would trail the content change.
  &.is-centered {
    flex-grow: 1;
    transition-property: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition-property: none;
  }
`;

const EditableInboxEditorSection = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const isComposerCentered = useIsInboxComposerCentered();
  const hasPageContentInset = useHasInboxThreadPageContentInset();
  const hasReachedAiChatCreditsCap = useHasReachedAiChatCreditsCap();
  const hasReachedAiChatUsageLimit = useHasReachedAiChatUsageLimit();
  const shouldShowUsageLimitBanner =
    !hasReachedAiChatCreditsCap && hasReachedAiChatUsageLimit;
  const aiModels = useAtomStateValue(aiModelsState);
  const hasNoEnabledModels = aiModels.length === 0;
  const canSendInboxMessage = useCanSendInboxMessage();
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const isDirectMessage = useAtomFamilySelectorValue(
    inboxThreadIsDirectMessageFamilySelector,
    currentInboxThread,
  );

  const { editor } = useInboxEditor();

  const insertDictatedText = useInsertDictatedText(editor);
  const [dictationInterimText, setDictationInterimText] = useState('');

  const composer = (
    <StyledInputBox isMobile={isMobile}>
      <InboxComposerQuote />
      <StyledEditorWrapper isMobile={isMobile}>
        <EditorContent editor={editor} />
      </StyledEditorWrapper>
      {!isDirectMessage && (
        <InboxDictationHint interimText={dictationInterimText} />
      )}
      <InboxComposerActionsRow
        leftActions={
          !isDirectMessage && (
            <>
              <InboxAddMenu editor={editor} />
              <InboxDictationButton />
              <AiChatContextUsageButton />
            </>
          )
        }
        modelTierDropdownId="ai-chat-model-tier-dropdown"
        isModelPickerHidden={isDirectMessage}
        sendButton={<SendMessageButton isDisabled={!canSendInboxMessage} />}
      />
    </StyledInputBox>
  );
  const inboxHasMessage = useAtomStateValue(inboxHasMessageSelector);

  return (
    <>
      <InboxEditorFocusEffect editor={editor} />
      <AiChatSentMessageHandOffEffect
        editor={editor}
        isComposerCentered={isComposerCentered}
      />
      {!isDirectMessage && (
        <InboxDictationEffect
          onInterimText={setDictationInterimText}
          onFinalText={insertDictatedText}
        />
      )}
      {!inboxHasMessage && (
        <StyledMessageListPlaceholder>
          {!isComposerCentered && !isDirectMessage && <InboxEmptyState />}
          <InboxStandaloneError />
        </StyledMessageListPlaceholder>
      )}

      <StyledInputArea
        isMobile={isMobile}
        isCentered={isComposerCentered}
        hasPageContentInset={hasPageContentInset}
      >
        {isComposerCentered && !isDirectMessage && (
          <InboxEmptyState isCentered />
        )}
        {!isDirectMessage && <AgentChatContextPreview />}
        {hasNoEnabledModels && !isDirectMessage && (
          <InboxInlineBanner>{t`No AI provider is configured on this instance.`}</InboxInlineBanner>
        )}
        {hasReachedAiChatCreditsCap && !isDirectMessage && (
          <InboxNoMoreBillingCreditsBanner />
        )}
        {shouldShowUsageLimitBanner && !isDirectMessage && (
          <AiChatUsageLimitReachedBanner />
        )}
        {!isDirectMessage && <AiChatUserCreditsExhaustedBanner />}
        {!isDirectMessage && <InboxParticipantMentionBar editor={editor} />}
        <AiChatPendingAskGate>{composer}</AiChatPendingAskGate>
      </StyledInputArea>
      <StyledComposerBottomSpacer
        className={isComposerCentered ? 'is-centered' : undefined}
      />
    </>
  );
};

export const InboxEditorSection = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const access = useCurrentInboxThreadAccess();
  const hasPageContentInset = useHasInboxThreadPageContentInset();
  if (access !== 'writer') {
    return (
      <StyledInputArea
        isMobile={isMobile}
        hasPageContentInset={hasPageContentInset}
      >
        <div role="status">
          {access === 'loading'
            ? t`Loading conversation…`
            : access === 'unavailable'
              ? t`This conversation is no longer available.`
              : t`View only — You can read this conversation.`}
        </div>
        <InboxStandaloneError />
      </StyledInputArea>
    );
  }
  return <EditableInboxEditorSection />;
};
