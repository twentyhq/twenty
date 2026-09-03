import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { IconCheck, useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type InboxItemToolCall,
  InboxItemToolCallStatus,
} from '~/generated/graphql';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledRow = styled.button<{ isSelected: boolean; isRejected: boolean }>`
  align-items: center;
  background: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.background.transparent.light
      : 'transparent'};
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  min-height: 32px;
  opacity: ${({ isRejected }) => (isRejected ? 0.5 : 1)};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  text-align: left;
  text-decoration: ${({ isRejected }) =>
    isRejected ? 'line-through' : 'none'};
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledIcon = styled.span<{ isDone: boolean }>`
  align-items: center;
  color: ${({ isDone }) =>
    isDone
      ? themeCssVariables.color.green
      : themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

const StyledLabel = styled.span`
  flex-shrink: 0;
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledError = styled.span`
  color: ${themeCssVariables.color.red};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
`;

type InboxPlanToolCallListProps = {
  toolCalls: InboxItemToolCall[];
  selectedToolCallId: string | null;
  onSelect: (toolCallId: string) => void;
};

// The plan as the agent laid it out: one line per call, in order. Selecting a
// line opens its editor below.
export const InboxPlanToolCallList = ({
  toolCalls,
  selectedToolCallId,
  onSelect,
}: InboxPlanToolCallListProps) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  return (
    <StyledList>
      {toolCalls.map((toolCall) => {
        const ToolIcon = getIcon(toolCall.icon);
        const isExecuted = toolCall.status === InboxItemToolCallStatus.EXECUTED;

        return (
          <StyledRow
            key={toolCall.id}
            type="button"
            isSelected={toolCall.id === selectedToolCallId}
            isRejected={toolCall.status === InboxItemToolCallStatus.REJECTED}
            onClick={() => onSelect(toolCall.id)}
          >
            <StyledIcon isDone={isExecuted}>
              {isExecuted ? (
                <IconCheck size={theme.icon.size.md} />
              ) : (
                <ToolIcon size={theme.icon.size.md} />
              )}
            </StyledIcon>
            <StyledLabel>{toolCall.label}</StyledLabel>
            {isNonEmptyString(toolCall.description) && (
              <StyledDescription>{toolCall.description}</StyledDescription>
            )}
            {toolCall.status === InboxItemToolCallStatus.FAILED &&
              isNonEmptyString(toolCall.error) && (
                <StyledError>{toolCall.error}</StyledError>
              )}
          </StyledRow>
        );
      })}
    </StyledList>
  );
};
