import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';

import { IconChevronDown, IconChevronUp } from 'twenty-ui/display';
import { JsonTree } from 'twenty-ui/json-visualizer';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

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
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.border.color.light};
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

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
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

const StyledJsonContainer = styled.div`
  max-height: 400px;
  overflow: auto;
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

  const hasError = isDefined(errorText);
  const isExpandable = isDefined(output) || hasError;

  const isTwoFirstDepths = ({ depth }: { depth: number }) => depth < 2;

  if (!output && !hasError) {
    return (
      <StyledContainer>
        <StyledLoadingContainer>
          <ShimmeringText>
            <StyledDisplayMessage>
              {getToolDisplayMessage(input, toolName, false)}
            </StyledDisplayMessage>
          </ShimmeringText>
        </StyledLoadingContainer>
      </StyledContainer>
    );
  }

  const displayMessage = hasError
    ? 'Tool execution failed'
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
        <StyledIconTextContainer>
          <ToolIcon size={theme.icon.size.sm} />
          <StyledDisplayMessage>{displayMessage}</StyledDisplayMessage>
        </StyledIconTextContainer>
        {isExpandable &&
          (isExpanded ? (
            <IconChevronUp size={theme.icon.size.sm} />
          ) : (
            <IconChevronDown size={theme.icon.size.sm} />
          ))}
      </StyledToggleButton>

      {isExpandable && (
        <AnimatedExpandableContainer isExpanded={isExpanded}>
          <StyledContentContainer>
            {hasError ? (
              <StyledJsonContainer>{errorText}</StyledJsonContainer>
            ) : (
              <>
                <StyledTabContainer>
                  <StyledTab
                    isActive={activeTab === 'output'}
                    onClick={() => setActiveTab('output')}
                  >
                    Output
                  </StyledTab>
                  <StyledTab
                    isActive={activeTab === 'input'}
                    onClick={() => setActiveTab('input')}
                  >
                    Input
                  </StyledTab>
                </StyledTabContainer>

                <StyledJsonContainer>
                  <JsonTree
                    value={
                      (activeTab === 'output' ? result : input) as JsonValue
                    }
                    shouldExpandNodeInitially={isTwoFirstDepths}
                    emptyArrayLabel={t`Empty Array`}
                    emptyObjectLabel={t`Empty Object`}
                    emptyStringLabel={t`[empty string]`}
                    arrowButtonCollapsedLabel={t`Expand`}
                    arrowButtonExpandedLabel={t`Collapse`}
                    onNodeValueClick={copyToClipboard}
                  />
                </StyledJsonContainer>
              </>
            )}
          </StyledContentContainer>
        </AnimatedExpandableContainer>
      )}
    </StyledContainer>
  );
};
