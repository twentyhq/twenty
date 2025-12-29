import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';

import { IconChevronDown, IconChevronUp } from 'twenty-ui/display';
import { JsonTree } from 'twenty-ui/json-visualizer';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { CodeExecutionDisplay } from '@/ai/components/CodeExecutionDisplay';
import { ShimmeringText } from '@/ai/components/ShimmeringText';
import { getToolIcon } from '@/ai/utils/getToolIcon';
import { getToolDisplayMessage } from '@/ai/utils/getWebSearchToolDisplayMessage';
import { useLingui } from '@lingui/react/macro';
import { type ToolUIPart } from 'ai';
import { isDefined } from 'twenty-shared/utils';
import { type JsonValue } from 'type-fest';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
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
  transition: color ${({ theme }) => theme.animation.duration.normal}s;
  justify-content: space-between;
  width: 100%;

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
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
  transition: color ${({ theme }) => theme.animation.duration.normal}s;
  padding-bottom: ${({ theme }) => theme.spacing(2)};

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

type TabType = 'output' | 'input';

export const ToolStepRenderer = ({ toolPart }: { toolPart: ToolUIPart }) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { copyToClipboard } = useCopyToClipboard();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('output');

  const { input, output, type, errorText } = toolPart;
  const toolName = type.split('-')[1];

  const toolInput =
    isDefined(input) && typeof input === 'object' && 'input' in input
      ? input.input
      : input;

  const hasError = isDefined(errorText);
  const isExpandable = isDefined(output) || hasError;

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

    const isRunning = !output && !hasError;

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
    return (
      <StyledContainer>
        <StyledToggleButton isExpandable={false}>
          <StyledLeftContent>
            <StyledLoadingContainer>
              <ShimmeringText>
                <StyledDisplayMessage>
                  {getToolDisplayMessage(input, toolName, false)}
                </StyledDisplayMessage>
              </ShimmeringText>
            </StyledLoadingContainer>
          </StyledLeftContent>
          <StyledRightContent>
            <StyledToolName>{toolName}</StyledToolName>
          </StyledRightContent>
        </StyledToggleButton>
      </StyledContainer>
    );
  }

  const displayMessage = hasError
    ? t`Tool execution failed`
    : output &&
        typeof output === 'object' &&
        'message' in output &&
        typeof output.message === 'string'
      ? output.message
      : getToolDisplayMessage(input, toolName, true);

  const result =
    output && typeof output === 'object' && 'result' in output
      ? (output as { result: string }).result
      : output;

  const ToolIcon = getToolIcon(toolName);

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
