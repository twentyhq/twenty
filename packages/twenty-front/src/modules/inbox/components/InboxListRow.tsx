import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxListRowButtons } from '@/inbox/components/InboxListRowButtons';
import { getInboxItemContext } from '@/inbox/utils/getInboxItemContext';
import { type InboxItem, InboxItemPriority } from '~/generated/graphql';
import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';

const StyledRowContainer = styled.div`
  cursor: pointer;
  padding-bottom: 2px;

  &:hover > div,
  &:focus-within > div {
    background: ${themeCssVariables.background.transparent.lighter};
  }

  &:active > div {
    background: ${themeCssVariables.accent.quaternary};
  }

  // Keyboard users reach the row's controls by tabbing, so focus has to reveal
  // them the way hovering does.
  &:hover .inbox-list-row-buttons,
  &:focus-within .inbox-list-row-buttons {
    display: flex;
  }

  &:hover .inbox-list-row-last-event-at,
  &:focus-within .inbox-list-row-last-event-at {
    display: none;
  }
`;

const StyledRow = styled.div<{ isSelected: boolean }>`
  background: ${({ isSelected }) =>
    isSelected ? themeCssVariables.accent.quaternary : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 6px;
`;

// The controls are siblings of this rather than descendants, so a nested button
// never loses its semantics inside another button.
const StyledOpenTarget = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledLine = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledUnreadDot = styled.div`
  background: ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.rounded};
  flex-shrink: 0;
  height: 6px;
  width: 6px;
`;

const StyledReadPlaceholder = styled.div`
  flex-shrink: 0;
  width: 6px;
`;

const StyledTypeIcon = styled.div<{ needsAction: boolean }>`
  align-items: center;
  color: ${({ needsAction }) =>
    needsAction
      ? themeCssVariables.color.orange
      : themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

const StyledTitle = styled.div<{ isUnread: boolean }>`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-weight: ${({ isUnread }) =>
    isUnread
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledToolIcons = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  gap: 2px;
`;

const MAX_ROW_TOOL_ICONS = 4;

const StyledSecondLine = styled(StyledLine)`
  color: ${themeCssVariables.font.color.tertiary};
  padding-left: calc(
    6px + ${themeCssVariables.spacing[2]} + 16px +
      ${themeCssVariables.spacing[2]}
  );
`;

const StyledSummary = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledLastEventAt = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  margin-left: auto;
`;

// Beside the open target rather than inside it, so the control is never a
// button within a button.
const StyledButtonsSlot = styled.div`
  align-self: flex-start;
  display: none;
  flex-shrink: 0;
`;

type InboxListRowProps = {
  inboxItem: InboxItem;
  isSelected: boolean;
  onClick: () => void;
};

export const InboxListRow = ({
  inboxItem,
  isSelected,
  onClick,
}: InboxListRowProps) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const InboxItemIcon = getIcon(inboxItem.inboxItemType.icon);
  const needsAction = inboxItem.priority === InboxItemPriority.NEEDS_ACTION;
  const toolIcons = inboxItem.toolCalls
    .slice(0, MAX_ROW_TOOL_ICONS)
    .map((toolCall) => ({ id: toolCall.id, Icon: getIcon(toolCall.icon) }));
  const { summary } = getInboxItemContext(inboxItem);
  const hasSecondLine = toolIcons.length > 0 || isNonEmptyString(summary);

  return (
    <StyledRowContainer>
      <StyledRow isSelected={isSelected}>
        <StyledOpenTarget
          role="button"
          tabIndex={0}
          aria-label={t`Open ${inboxItem.title}`}
          onClick={onClick}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) {
              return;
            }

            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onClick();
            }
          }}
        >
          <StyledLine>
            {inboxItem.isUnread ? (
              <StyledUnreadDot />
            ) : (
              <StyledReadPlaceholder />
            )}
            <StyledTypeIcon needsAction={needsAction}>
              <InboxItemIcon size={theme.icon.size.md} color="currentColor" />
            </StyledTypeIcon>
            <StyledTitle isUnread={inboxItem.isUnread}>
              {inboxItem.title}
            </StyledTitle>
            <StyledLastEventAt className="inbox-list-row-last-event-at">
              {beautifyPastDateRelativeToNowShort(inboxItem.lastEventAt)}
            </StyledLastEventAt>
          </StyledLine>
          {hasSecondLine && (
            <StyledSecondLine>
              {toolIcons.length > 0 && (
                <StyledToolIcons>
                  {toolIcons.map(({ id, Icon }) => (
                    <Icon key={id} size={theme.icon.size.sm} />
                  ))}
                </StyledToolIcons>
              )}
              {isNonEmptyString(summary) && (
                <StyledSummary>{summary}</StyledSummary>
              )}
            </StyledSecondLine>
          )}
        </StyledOpenTarget>
        <StyledButtonsSlot className="inbox-list-row-buttons">
          <InboxListRowButtons inboxItem={inboxItem} />
        </StyledButtonsSlot>
      </StyledRow>
    </StyledRowContainer>
  );
};
