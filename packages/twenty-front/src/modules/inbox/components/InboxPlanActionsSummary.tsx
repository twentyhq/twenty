import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type InboxItemToolCall,
  InboxItemToolCallStatus,
} from '~/generated/graphql';

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledRow = styled.button<{ isRejected: boolean }>`
  background: transparent;
  border: none;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
  opacity: ${({ isRejected }) => (isRejected ? 0.5 : 1)};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  text-align: left;
  width: 100%;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledTitleLine = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
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

const StyledLabel = styled.span<{ isRejected: boolean }>`
  font-weight: ${themeCssVariables.font.weight.medium};
  text-decoration: ${({ isRejected }) =>
    isRejected ? 'line-through' : 'none'};
`;

const StyledStatus = styled.span<{ isFailure: boolean }>`
  color: ${({ isFailure }) =>
    isFailure
      ? themeCssVariables.color.red
      : themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-left: auto;
  max-width: 40%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  padding-left: calc(${themeCssVariables.spacing[2]} + 16px);
`;

type InboxPlanActionsSummaryProps = {
  toolCalls: InboxItemToolCall[];
  onSelect: (toolCallId: string) => void;
};

export const InboxPlanActionsSummary = ({
  toolCalls,
  onSelect,
}: InboxPlanActionsSummaryProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const getStatusLabel = (toolCall: InboxItemToolCall) => {
    switch (toolCall.status) {
      case InboxItemToolCallStatus.EXECUTED:
        return t`Done`;
      case InboxItemToolCallStatus.REJECTED:
        return t`Skipped`;
      case InboxItemToolCallStatus.FAILED:
        return isNonEmptyString(toolCall.error) ? toolCall.error : t`Failed`;
      default:
        return null;
    }
  };

  return (
    <StyledCard>
      {toolCalls.map((toolCall) => {
        const ToolIcon = getIcon(toolCall.icon);
        const statusLabel = getStatusLabel(toolCall);
        const isRejected = toolCall.status === InboxItemToolCallStatus.REJECTED;

        return (
          <StyledRow
            key={toolCall.id}
            type="button"
            isRejected={isRejected}
            onClick={() => onSelect(toolCall.id)}
          >
            <StyledTitleLine>
              <StyledIcon
                isDone={toolCall.status === InboxItemToolCallStatus.EXECUTED}
              >
                <ToolIcon size={theme.icon.size.md} />
              </StyledIcon>
              <StyledLabel isRejected={isRejected}>
                {toolCall.label}
              </StyledLabel>
              {isNonEmptyString(statusLabel) && (
                <StyledStatus
                  isFailure={toolCall.status === InboxItemToolCallStatus.FAILED}
                  title={statusLabel}
                >
                  {statusLabel}
                </StyledStatus>
              )}
            </StyledTitleLine>
            {isNonEmptyString(toolCall.description) && (
              <StyledDescription>{toolCall.description}</StyledDescription>
            )}
          </StyledRow>
        );
      })}
    </StyledCard>
  );
};
