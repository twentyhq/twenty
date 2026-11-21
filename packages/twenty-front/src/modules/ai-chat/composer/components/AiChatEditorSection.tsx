import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useCurrentAiChatThreadAccess } from '@/ai-chat/threads/hooks/useCurrentAiChatThreadAccess';
import { StyledAiChatContentContainer } from '@/ai-chat/components/StyledAiChatContentContainer';
import { useState } from 'react';

import { styled } from '@linaria/react';
import { EditorContent } from '@tiptap/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatComposerQuote } from '@/ai-chat/composer/components/AiChatComposerQuote';
import { StyledChatComposerBox } from '@/chat/components/StyledChatComposerBox';
import { AiChatInlineBanner } from '@/ai-chat/components/AiChatInlineBanner';
import { AiChatEmptyState } from '@/ai-chat/composer/components/AiChatEmptyState';
import { AiChatParticipantMentionBar } from '@/ai-chat/composer/components/AiChatParticipantMentionBar';
import { AiChatPendingAskGate } from '@/ai-chat/tool-calls/components/AiChatPendingAskGate';
import { AiChatNoMoreBillingCreditsBanner } from '@/ai-chat/usage/components/AiChatNoMoreBillingCreditsBanner';
import { AiChatUsageLimitReachedBanner } from '@/ai-chat/usage/components/AiChatUsageLimitReachedBanner';
import { AiChatUserCreditsExhaustedBanner } from '@/ai-chat/usage/components/AiChatUserCreditsExhaustedBanner';
import { AiChatStandaloneError } from '@/ai-chat/composer/components/AiChatStandaloneError';
import { AiChatContextPreview } from '@/ai-chat/composer/components/AiChatContextPreview';
import { AiChatAddMenu } from '@/ai-chat/composer/components/AiChatAddMenu';
import { AiChatDictationButton } from '@/ai-chat/dictation/components/AiChatDictationButton';
import { AiChatDictationEffect } from '@/ai-chat/dictation/components/AiChatDictationEffect';
import { AiChatDictationHint } from '@/ai-chat/dictation/components/AiChatDictationHint';
import { AiChatComposerActionsRow } from '@/ai-chat/components/AiChatComposerActionsRow';
import { AiChatContextUsageButton } from '@/ai-chat/usage/components/AiChatContextUsageButton';
import { SendMessageButton } from '@/ai-chat/composer/components/SendMessageButton';
import { useSendAiChatComposerMessage } from '@/ai-chat/composer/hooks/useSendAiChatComposerMessage';
import { useAiChatEditor } from '@/ai-chat/composer/hooks/useAiChatEditor';
import { useInsertDictatedText } from '@/ai-chat/dictation/hooks/useInsertDictatedText';
import { AI_CHAT_PAGE_CONTENT_INLINE_PADDING } from '@/ai-chat/constants/AiChatPageContentInlinePadding';
import { useHasAiChatPageContentInset } from '@/ai-chat/hooks/useHasAiChatPageContentInset';
import { useIsAiChatComposerCentered } from '@/ai-chat/composer/hooks/useIsAiChatComposerCentered';
import { useHasReachedAiChatCreditsCap } from '@/ai-chat/usage/hooks/useHasReachedAiChatCreditsCap';
import { useHasReachedAiChatUsageLimit } from '@/ai-chat/usage/hooks/useHasReachedAiChatUsageLimit';
import { aiChatHasMessageFamilySelector } from '@/ai-chat/states/selectors/aiChatHasMessageFamilySelector';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useIsMobile } from 'twenty-ui/utilities';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCanSendAiChatMessage } from '@/ai-chat/composer/hooks/useCanSendAiChatMessage';
import { aiChatThreadIsDirectMessageFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadIsDirectMessageFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

const StyledInputArea = styled(StyledAiChatContentContainer)<{
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
      ? AI_CHAT_PAGE_CONTENT_INLINE_PADDING
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

const EditableAiChatEditorSection = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const isComposerCentered = useIsAiChatComposerCentered();
  const hasPageContentInset = useHasAiChatPageContentInset();
  const hasReachedAiChatCreditsCap = useHasReachedAiChatCreditsCap();
  const hasReachedAiChatUsageLimit = useHasReachedAiChatUsageLimit();
  const shouldShowUsageLimitBanner =
    !hasReachedAiChatCreditsCap && hasReachedAiChatUsageLimit;
  const aiModels = useAtomStateValue(aiModelsState);
  const hasNoEnabledModels = aiModels.length === 0;
  const canSendAiChatMessage = useCanSendAiChatMessage();
  const { threadId } = useAiChatInstanceOrThrow();
  const isDirectMessage = useAtomFamilySelectorValue(
    aiChatThreadIsDirectMessageFamilySelector,
    threadId,
  );

  const { sendAiChatComposerMessage } = useSendAiChatComposerMessage();
  const { editor } = useAiChatEditor({ onSend: sendAiChatComposerMessage });

  const insertDictatedText = useInsertDictatedText(editor);
  const [dictationInterimText, setDictationInterimText] = useState('');

  const composer = (
    <StyledInputBox isMobile={isMobile}>
      <AiChatComposerQuote />
      <StyledEditorWrapper isMobile={isMobile}>
        <EditorContent editor={editor} />
      </StyledEditorWrapper>
      {!isDirectMessage && (
        <AiChatDictationHint interimText={dictationInterimText} />
      )}
      <AiChatComposerActionsRow
        leftActions={
          !isDirectMessage && (
            <>
              <AiChatAddMenu editor={editor} />
              <AiChatDictationButton />
              <AiChatContextUsageButton />
            </>
          )
        }
        modelTierDropdownId="ai-chat-model-tier-dropdown"
        isModelPickerHidden={isDirectMessage}
        sendButton={
          <SendMessageButton
            isDisabled={!canSendAiChatMessage}
            editor={editor}
          />
        }
      />
    </StyledInputBox>
  );
  const aiChatHasMessage = useAtomFamilySelectorValue(
    aiChatHasMessageFamilySelector,
    threadId,
  );

  return (
    <>
      {!isDirectMessage && (
        <AiChatDictationEffect
          onInterimText={setDictationInterimText}
          onFinalText={insertDictatedText}
        />
      )}
      {!aiChatHasMessage && (
        <StyledMessageListPlaceholder>
          {!isComposerCentered && !isDirectMessage && <AiChatEmptyState />}
          <AiChatStandaloneError />
        </StyledMessageListPlaceholder>
      )}

      <StyledInputArea
        isMobile={isMobile}
        isCentered={isComposerCentered}
        hasPageContentInset={hasPageContentInset}
      >
        {isComposerCentered && <AiChatEmptyState isCentered />}
        {!isDirectMessage && <AiChatContextPreview />}
        {hasNoEnabledModels && !isDirectMessage && (
          <AiChatInlineBanner>{t`No AI provider is configured on this instance.`}</AiChatInlineBanner>
        )}
        {hasReachedAiChatCreditsCap && !isDirectMessage && (
          <AiChatNoMoreBillingCreditsBanner />
        )}
        {shouldShowUsageLimitBanner && !isDirectMessage && (
          <AiChatUsageLimitReachedBanner />
        )}
        {!isDirectMessage && <AiChatUserCreditsExhaustedBanner />}
        {!isDirectMessage && <AiChatParticipantMentionBar editor={editor} />}
        <AiChatPendingAskGate>{composer}</AiChatPendingAskGate>
      </StyledInputArea>
      <StyledComposerBottomSpacer
        className={isComposerCentered ? 'is-centered' : undefined}
      />
    </>
  );
};

export const AiChatEditorSection = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const access = useCurrentAiChatThreadAccess();
  const hasPageContentInset = useHasAiChatPageContentInset();
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
        <AiChatStandaloneError />
      </StyledInputArea>
    );
  }
  return <EditableAiChatEditorSection />;
};
