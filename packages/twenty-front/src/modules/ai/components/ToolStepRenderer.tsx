import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';

import { IconChevronDown, IconChevronUp } from 'twenty-ui/display';
import { JsonTree } from 'twenty-ui/json-visualizer';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { CodeExecutionDisplay } from '@/ai/components/CodeExecutionDisplay';
import { ShimmeringText } from '@/ai/components/ShimmeringText';
import { getToolIcon } from '@/ai/utils/getToolIcon';
import {
  getToolDisplayMessage,
  resolveToolInput,
} from '@/ai/utils/getToolDisplayMessage';
import { ToolOutputMessageSchema } from '@/ai/schemas/toolOutputMessageSchema';
import { ToolOutputResultSchema } from '@/ai/schemas/toolOutputResultSchema';
import { useLingui } from '@lingui/react/macro';
import { type ToolUIPart } from 'ai';
import { isDefined } from 'twenty-shared/utils';
import { type JsonValue } from 'type-fest';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-family: ${({ theme }) => theme.font.family};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledContentContainer = styled.div`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  min-width: 0;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledJsonTreeContainer = styled.div`
  overflow-x: auto;

  ul {
    min-width: 0;
  }
`;

const StyledToggleButton = styled.div<{ isExpandable: boolean }>`
  align-items: center;
  background: none;
  border: none;
  cursor: ${({ isExpandable }) => (isExpandable ? 'pointer' : 'auto')};
  display: flex;
  color: ${({ theme }) => theme.font.color.tertiary};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} 0;
  transition: color ${({ theme }) => theme.animation.duration.fast}s ease-in-out;
  justify-content: space-between;
  width: 100%;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledToolName = styled.span`
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  color: ${({ theme }) => theme.font.color.light};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.xs};
  padding: ${({ theme }) => theme.spacing(0.5)}
    ${({ theme }) => theme.spacing(1)};
`;

const StyledLeftContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledRightContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDisplayMessage = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledIconTextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};

  svg {
    min-width: ${({ theme }) => theme.icon.size.sm}px;
  }
`;

const StyledTabContainer = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledTab = styled.div<{ isActive: boolean }>`
  color: ${({ theme, isActive }) =>
    isActive ? theme.font.color.primary : theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme, isActive }) =>
    isActive ? theme.font.weight.medium : theme.font.weight.regular};
  cursor: pointer;
  transition: color ${({ theme }) => theme.animation.duration.fast}s ease-in-out;
  padding-bottom: ${({ theme }) => theme.spacing(2)};

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

type TabType = 'output' | 'input';

export const ToolStepRenderer = ({
  toolPart,
  isStreaming,
}: {
  toolPart: ToolUIPart;
  isStreaming: boolean;
}) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { copyToClipboard } = useCopyToClipboard();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('output');

  const { input, output, type, errorText } = toolPart;
  const rawToolName = type.split('-')[1];

  const { resolvedInput: toolInput, resolvedToolName: toolName } =
    resolveToolInput(input, rawToolName);

  const hasError = isDefined(errorText);
  const isExpandable = isDefined(output) || hasError;
  const ToolIcon = getToolIcon(toolName);

  if (toolName === 'code_interpreter') {
    const codeInput = toolInput as { code?: string } | undefined;
    const codeOutput = output as {
      result?: {
        stdout?: string;
        stderr?: string;
        exitCode?: number;
        files?: Array<{ filename: string; url: string; mimeType?: string }>;
      };
    } | null;

    const isRunning = !output && !hasError && isStreaming;

    return (
      <CodeExecutionDisplay
        code={codeInput?.code ?? ''}
        stdout={codeOutput?.result?.stdout ?? ''}
        stderr={codeOutput?.result?.stderr || errorText || ''}
        exitCode={codeOutput?.result?.exitCode}
        files={codeOutput?.result?.files}
        isRunning={isRunning}
      />
    );
  }

  if (!output && !hasError) {
    const displayText = isStreaming
      ? getToolDisplayMessage(input, rawToolName, false)
      : getToolDisplayMessage(input, rawToolName, true);

    return (
      <StyledContainer>
        <StyledToggleButton isExpandable={false}>
          <StyledLeftContent>
            <StyledIconTextContainer>
              <ToolIcon size={theme.icon.size.sm} />
              {isStreaming ? (
                <ShimmeringText>
                  <StyledDisplayMessage>{displayText}</StyledDisplayMessage>
                </ShimmeringText>
              ) : (
                <StyledDisplayMessage>{displayText}</StyledDisplayMessage>
              )}
            </StyledIconTextContainer>
          </StyledLeftContent>
          <StyledRightContent>
            <StyledToolName>{toolName}</StyledToolName>
          </StyledRightContent>
        </StyledToggleButton>
      </StyledContainer>
    );
  }

  // For execute_tool, the actual result is nested inside output.result
  const outputResult = ToolOutputResultSchema.safeParse(output);
  const unwrappedOutput =
    rawToolName === 'execute_tool' && outputResult.success
      ? outputResult.data.result
      : output;

  const unwrappedResult = ToolOutputResultSchema.safeParse(unwrappedOutput);
  const unwrappedMessage = ToolOutputMessageSchema.safeParse(unwrappedOutput);

  const displayMessage = hasError
    ? t`Tool execution failed`
    : rawToolName === 'learn_tools' ||
        rawToolName === 'execute_tool' ||
        rawToolName === 'load_skills'
      ? getToolDisplayMessage(input, rawToolName, true)
      : unwrappedMessage.success
        ? unwrappedMessage.data.message
        : getToolDisplayMessage(input, rawToolName, true);

  const result = unwrappedResult.success
    ? unwrappedResult.data.result
    : unwrappedOutput;

  return (
    <StyledContainer>
      <StyledToggleButton
        onClick={() => setIsExpanded(!isExpanded)}
        isExpandable={isExpandable}
      >
        <StyledLeftContent>
          <StyledIconTextContainer>
            <ToolIcon size={theme.icon.size.sm} />
            <StyledDisplayMessage>{displayMessage}</StyledDisplayMessage>
          </StyledIconTextContainer>
        </StyledLeftContent>
        <StyledRightContent>
          <StyledToolName>{toolName}</StyledToolName>
          {isExpandable &&
            (isExpanded ? (
              <IconChevronUp size={theme.icon.size.sm} />
            ) : (
              <IconChevronDown size={theme.icon.size.sm} />
            ))}
        </StyledRightContent>
      </StyledToggleButton>

      {isExpandable && (
        <AnimatedExpandableContainer isExpanded={isExpanded} mode="fit-content">
          <StyledContentContainer>
            {hasError ? (
              errorText
            ) : (
              <>
                <StyledTabContainer>
                  <StyledTab
                    isActive={activeTab === 'output'}
                    onClick={() => setActiveTab('output')}
                  >
                    {t`Output`}
                  </StyledTab>
                  <StyledTab
                    isActive={activeTab === 'input'}
                    onClick={() => setActiveTab('input')}
                  >
                    {t`Input`}
                  </StyledTab>
                </StyledTabContainer>

                <StyledJsonTreeContainer>
                  <JsonTree
                    value={
                      (activeTab === 'output' ? result : toolInput) as JsonValue
                    }
                    shouldExpandNodeInitially={() => false}
                    emptyArrayLabel={t`Empty Array`}
                    emptyObjectLabel={t`Empty Object`}
                    emptyStringLabel={t`[empty string]`}
                    arrowButtonCollapsedLabel={t`Expand`}
                    arrowButtonExpandedLabel={t`Collapse`}
                    onNodeValueClick={copyToClipboard}
                  />
                </StyledJsonTreeContainer>
              </>
            )}
          </StyledContentContainer>
        </AnimatedExpandableContainer>
      )}
    </StyledContainer>
  );
};
