import { styled } from '@linaria/react';
import { useContext, useState } from 'react';

import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import { JsonTree } from 'twenty-ui/json-visualizer';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { CodeExecutionDisplay } from '@/ai/components/CodeExecutionDisplay';
import { ShimmeringText } from '@/ai/components/ShimmeringText';
import { useToolLabelMap } from '@/ai/hooks/useToolLabel';
import {
  resolveToolDisplayMessage,
  resolveToolInput,
} from '@/ai/utils/getToolDisplayMessage';
import { getToolIcon } from '@/ai/utils/getToolIcon';
import { useLingui } from '@lingui/react/macro';
import { type DynamicToolUIPart, getToolName, type ToolUIPart } from 'ai';
import { isDefined } from 'twenty-shared/utils';
import { type JsonValue } from 'type-fest';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-family: ${themeCssVariables.font.family};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledContentContainer = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  min-width: 0;
  padding: ${themeCssVariables.spacing[3]};
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
  color: ${themeCssVariables.font.color.tertiary};
  cursor: ${({ isExpandable }) => (isExpandable ? 'pointer' : 'auto')};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[1]} 0;
  transition: color calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;
  width: 100%;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledToolName = styled.span`
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${themeCssVariables.font.color.light};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[1]};
`;

const StyledLeftContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledRightContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledDisplayMessage = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledIconTextContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};

  svg {
    min-width: calc(${themeCssVariables.icon.size.sm} * 1px);
  }
`;

const StyledTabContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledTab = styled.div<{ isActive: boolean }>`
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
  padding-bottom: ${themeCssVariables.spacing[2]};
  transition: color calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

type TabType = 'output' | 'input';

export const ToolStepRenderer = ({
  toolPart,
  isStreaming,
}: {
  toolPart: ToolUIPart | DynamicToolUIPart;
  isStreaming: boolean;
}) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('output');

  const { input, output, errorText } = toolPart;
  const rawToolName = getToolName(toolPart);

  const { resolvedInput: toolInput, resolvedToolName: toolName } =
    resolveToolInput(input, rawToolName);

  const labelMap = useToolLabelMap();
  const hasError = isDefined(errorText);
  const isCodeInterpreter = toolName === 'code_interpreter';
  const isExpandable = isDefined(output) || hasError || isCodeInterpreter;
  const ToolIcon = getToolIcon(toolName);

  const outputObj =
    typeof output === 'object' && output !== null
      ? (output as Record<string, unknown>)
      : null;
  const toolMessage =
    typeof outputObj?.message === 'string' ? outputObj.message : null;
  const toolError =
    typeof outputObj?.error === 'string' ? outputObj.error : null;

  const codeInput = isCodeInterpreter
    ? (toolInput as { code?: string } | undefined)
    : null;
  const codeOutput = isCodeInterpreter
    ? (outputObj as {
        stdout?: string;
        stderr?: string;
        exitCode?: number;
        files?: Array<{
          fileId: string;
          filename: string;
          url: string;
          mimeType?: string;
        }>;
      } | null)
    : null;

  if (!output && !hasError) {
    const displayText = resolveToolDisplayMessage({
      input,
      toolName: rawToolName,
      isFinished: !isStreaming,
      labelMap,
      output,
    });

    return (
      <StyledContainer>
        <StyledToggleButton
          isExpandable={isCodeInterpreter}
          onClick={
            isCodeInterpreter ? () => setIsExpanded(!isExpanded) : undefined
          }
        >
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
            {isCodeInterpreter &&
              (isExpanded ? (
                <IconChevronUp size={theme.icon.size.sm} />
              ) : (
                <IconChevronDown size={theme.icon.size.sm} />
              ))}
          </StyledRightContent>
        </StyledToggleButton>
        {isCodeInterpreter && (
          <AnimatedExpandableContainer
            isExpanded={isExpanded}
            mode="fit-content"
          >
            <CodeExecutionDisplay
              code={codeInput?.code ?? ''}
              stdout=""
              stderr=""
              isRunning={isStreaming}
            />
          </AnimatedExpandableContainer>
        )}
      </StyledContainer>
    );
  }

  const displayMessage = hasError
    ? t`Tool execution failed`
    : rawToolName === 'learn_tools' ||
        rawToolName === 'execute_tool' ||
        rawToolName === 'load_skills'
      ? resolveToolDisplayMessage({
          input,
          toolName: rawToolName,
          isFinished: true,
          labelMap,
          output,
        })
      : (toolMessage ??
        resolveToolDisplayMessage({
          input,
          toolName: rawToolName,
          isFinished: true,
          labelMap,
          output,
        }));

  const result = toolError ? { error: toolError } : outputObj;

  const renderExpandedContent = () => {
    if (isCodeInterpreter) {
      return (
        <CodeExecutionDisplay
          code={codeInput?.code ?? ''}
          stdout={codeOutput?.stdout ?? ''}
          stderr={codeOutput?.stderr || errorText || ''}
          exitCode={codeOutput?.exitCode}
          files={codeOutput?.files}
        />
      );
    }

    if (hasError) {
      return errorText;
    }

    return (
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
            value={(activeTab === 'output' ? result : toolInput) as JsonValue}
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
    );
  };

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
          {isCodeInterpreter ? (
            renderExpandedContent()
          ) : (
            <StyledContentContainer>
              {renderExpandedContent()}
            </StyledContentContainer>
          )}
        </AnimatedExpandableContainer>
      )}
    </StyledContainer>
  );
};
