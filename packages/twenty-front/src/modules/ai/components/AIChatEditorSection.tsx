import { styled } from '@linaria/react';
import { EditorContent } from '@tiptap/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AIChatEmptyState } from '@/ai/components/AIChatEmptyState';
import { AIChatStandaloneError } from '@/ai/components/AIChatStandaloneError';
import { AgentChatContextPreview } from '@/ai/components/internal/AgentChatContextPreview';
import { AgentChatFileUploadButton } from '@/ai/components/internal/AgentChatFileUploadButton';
import { AIChatContextUsageButton } from '@/ai/components/internal/AIChatContextUsageButton';
import { AIChatEditorFocusEffect } from '@/ai/components/internal/AIChatEditorFocusEffect';
import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { SendMessageButton } from '@/ai/components/internal/SendMessageButton';
import { useAIChatEditor } from '@/ai/hooks/useAIChatEditor';
import { useAiModelOptions } from '@/ai/hooks/useAiModelOptions';
import { useAgentChatModelId } from '@/ai/hooks/useAgentChatModelId';
import { agentChatUserSelectedModelState } from '@/ai/states/agentChatUserSelectedModelState';
import { Select } from '@/ui/input/components/Select';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type SelectOption } from 'twenty-ui/input';

const StyledInputArea = styled.div<{ isMobile: boolean }>`
  align-items: flex-end;
  background: ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  padding-block: ${({ isMobile }) =>
    isMobile ? '0' : themeCssVariables.spacing[3]};
  padding-inline: ${themeCssVariables.spacing[3]};
`;

const StyledInputBox = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 140px;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;

  &:focus-within {
    border-color: ${themeCssVariables.color.blue};
    box-shadow: 0px 0px 0px 3px ${themeCssVariables.color.transparent.blue2};
  }
`;

const StyledEditorWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  .tiptap {
    background: transparent;
    border: none;
    box-shadow: none;
    color: ${themeCssVariables.font.color.primary};
    font-family: inherit;
    font-size: ${themeCssVariables.font.size.md};
    font-weight: ${themeCssVariables.font.weight.regular};
    line-height: 16px;
    max-height: 320px;
    min-height: 48px;
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

const StyledButtonsContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const StyledLeftButtonsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledRightButtonsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const AIChatEditorSection = () => {
  const isMobile = useIsMobile();
  const { options, pinnedOption } = useAiModelOptions({
    variant: 'pinned-default',
  });

  const smartModelOptions: SelectOption<string | null>[] = options;
  const defaultPinnedOption: SelectOption<string | null> | undefined =
    pinnedOption
      ? {
          ...pinnedOption,
          value: null,
        }
      : undefined;
  const setAgentChatUserSelectedModel = useSetAtomState(
    agentChatUserSelectedModelState,
  );
  const { selectedModelId } = useAgentChatModelId();

  const { editor, handleSendAndClear } = useAIChatEditor();

  return (
    <>
      <AIChatEditorFocusEffect editor={editor} />
      <AIChatEmptyState editor={editor} />
      <AIChatStandaloneError />
      <AIChatSkeletonLoader />

      <StyledInputArea isMobile={isMobile}>
        <AgentChatContextPreview />
        <StyledInputBox>
          <StyledEditorWrapper>
            <EditorContent editor={editor} />
          </StyledEditorWrapper>
          <StyledButtonsContainer>
            <StyledLeftButtonsContainer>
              <AgentChatFileUploadButton />
              <AIChatContextUsageButton />
            </StyledLeftButtonsContainer>
            <StyledRightButtonsContainer>
              <Select
                dropdownId="ai-chat-smart-model-select"
                value={selectedModelId}
                onChange={setAgentChatUserSelectedModel}
                options={smartModelOptions}
                pinnedOption={defaultPinnedOption}
                selectSizeVariant="small"
                showContextualTextInControl={false}
                withSearchInput
                dropdownOffset={{ x: 0, y: 8 }}
              />
              <SendMessageButton onSend={handleSendAndClear} />
            </StyledRightButtonsContainer>
          </StyledButtonsContainer>
        </StyledInputBox>
      </StyledInputArea>
    </>
  );
};
