import { useCurrentAiChatThreadAccess } from '@/ai/hooks/useCurrentAiChatThreadAccess';
import { StyledAiChatContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { useState } from 'react';

import { styled } from '@linaria/react';
import { EditorContent } from '@tiptap/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

import { StyledChatComposerBox } from '@/chat/components/StyledChatComposerBox';
import { AiChatInlineBanner } from '@/ai/components/AiChatInlineBanner';
import { AiChatEmptyState } from '@/ai/components/AiChatEmptyState';
import { AiChatParticipantMentionBar } from '@/ai/components/AiChatParticipantMentionBar';
import { AiChatPendingAskGate } from '@/ai/components/AiChatPendingAskGate';
import { AiChatNoMoreBillingCreditsBanner } from '@/ai/components/AiChatNoMoreBillingCreditsBanner';
import { AiChatUsageLimitReachedBanner } from '@/ai/components/AiChatUsageLimitReachedBanner';
import { AiChatUserCreditsExhaustedBanner } from '@/ai/components/AiChatUserCreditsExhaustedBanner';
import { AiChatStandaloneError } from '@/ai/components/AiChatStandaloneError';
import { AgentChatContextPreview } from '@/ai/components/internal/AgentChatContextPreview';
import { AiChatAddMenu } from '@/ai/components/AiChatAddMenu';
import { AiChatDictationButton } from '@/ai/dictation/components/AiChatDictationButton';
import { AiChatDictationEffect } from '@/ai/dictation/components/AiChatDictationEffect';
import { AiChatDictationHint } from '@/ai/dictation/components/AiChatDictationHint';
import { AiChatComposerActionsRow } from '@/ai/components/internal/AiChatComposerActionsRow';
import { AiChatContextUsageButton } from '@/ai/components/internal/AiChatContextUsageButton';
import { AiChatEditorFocusEffect } from '@/ai/components/internal/AiChatEditorFocusEffect';
import { AiChatSentMessageHandOffEffect } from '@/ai/components/internal/AiChatSentMessageHandOffEffect';
import { SendMessageButton } from '@/ai/components/internal/SendMessageButton';
import { useAiChatEditor } from '@/ai/hooks/useAiChatEditor';
import { useInsertDictatedText } from '@/ai/dictation/hooks/useInsertDictatedText';
import { AI_CHAT_PAGE_CONTENT_INLINE_PADDING } from '@/ai/constants/AiChatPageContentInlinePadding';
import { useHasAiChatPageContentInset } from '@/ai/hooks/useHasAiChatPageContentInset';
import { useIsAiChatComposerCentered } from '@/ai/hooks/useIsAiChatComposerCentered';
import { useHasReachedAiChatCreditsCap } from '@/ai/hooks/useHasReachedAiChatCreditsCap';
import { useHasReachedAiChatUsageLimit } from '@/ai/hooks/useHasReachedAiChatUsageLimit';
import { agentChatHasMessageSelector } from '@/ai/states/selectors/agentChatHasMessageSelector';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useIsMobile } from 'twenty-ui/utilities';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCanSendAgentChatMessage } from '@/ai/hooks/useCanSendAgentChatMessage';
import { agentChatThreadIsDirectMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadIsDirectMessageFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';

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
  const canSendAgentChatMessage = useCanSendAgentChatMessage();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const isDirectMessage = useAtomFamilySelectorValue(
    agentChatThreadIsDirectMessageFamilySelector,
    currentAiChatThread,
  );

  const { editor } = useAiChatEditor();

  const insertDictatedText = useInsertDictatedText(editor);
  const [dictationInterimText, setDictationInterimText] = useState('');

  const composer = (
    <StyledInputBox isMobile={isMobile}>
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
        sendButton={<SendMessageButton isDisabled={!canSendAgentChatMessage} />}
      />
    </StyledInputBox>
  );
  const agentChatHasMessage = useAtomStateValue(agentChatHasMessageSelector);

  return (
    <>
      <AiChatEditorFocusEffect editor={editor} />
      <AiChatSentMessageHandOffEffect
        editor={editor}
        isComposerCentered={isComposerCentered}
      />
      {!isDirectMessage && (
        <AiChatDictationEffect
          onInterimText={setDictationInterimText}
          onFinalText={insertDictatedText}
        />
      )}
      {!agentChatHasMessage && (
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
        {isComposerCentered && !isDirectMessage && (
          <AiChatEmptyState isCentered />
        )}
        {!isDirectMessage && <AgentChatContextPreview />}
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
