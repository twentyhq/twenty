import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { useInboxItemClick } from '@/inbox/hooks/useInboxItemClick';
import { selectedInboxItemIdState } from '@/inbox/states/selectedInboxItemIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type InboxItem, InboxItemPriority } from '~/generated/graphql';
import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';

const StyledInboxItem = styled.div<{ $isSelected: boolean }>`
  align-items: flex-start;
  background: ${({ $isSelected }) =>
    $isSelected
      ? themeCssVariables.background.transparent.light
      : 'transparent'};
  border-left: 3px solid
    ${({ $isSelected }) =>
      $isSelected ? themeCssVariables.color.blue : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} 1px;
  position: relative;
  right: 3px;
  transition: all 0.2s ease;
  width: calc(100% + 1px);

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledInboxItemIcon = styled.div<{ $needsAction: boolean }>`
  align-items: center;
  background: ${({ $needsAction }) =>
    $needsAction
      ? themeCssVariables.background.transparent.orange
      : themeCssVariables.background.transparent.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ $needsAction }) =>
    $needsAction
      ? themeCssVariables.color.orange
      : themeCssVariables.color.blue};
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledInboxItemContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  min-width: 0;
`;

const StyledInboxItemHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledUnreadDot = styled.div`
  background: ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.rounded};
  flex-shrink: 0;
  height: 6px;
  width: 6px;
`;

const StyledInboxItemTitle = styled.div<{ $isUnread: boolean }>`
  color: ${themeCssVariables.font.color.secondary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${({ $isUnread }) =>
    $isUnread
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledInboxItemTimestamp = styled.div`
  color: ${themeCssVariables.font.color.light};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledInboxItemPreview = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type InboxListItemProps = {
  inboxItem: InboxItem;
};

export const InboxListItem = ({ inboxItem }: InboxListItemProps) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const { handleInboxItemClick } = useInboxItemClick();
  const selectedInboxItemId = useAtomStateValue(selectedInboxItemIdState);

  const InboxItemIcon = getIcon(inboxItem.inboxItemType.icon);
  const isUnread = !isDefined(inboxItem.readAt);
  const needsAction = inboxItem.priority === InboxItemPriority.NEEDS_ACTION;

  return (
    <StyledInboxItem
      $isSelected={selectedInboxItemId === inboxItem.id}
      role="button"
      tabIndex={0}
      onClick={() => handleInboxItemClick(inboxItem)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleInboxItemClick(inboxItem);
        }
      }}
    >
      <StyledInboxItemIcon $needsAction={needsAction}>
        <InboxItemIcon size={theme.icon.size.md} color="currentColor" />
      </StyledInboxItemIcon>
      <StyledInboxItemContent>
        <StyledInboxItemHeader>
          {isUnread && <StyledUnreadDot />}
          <StyledInboxItemTitle $isUnread={isUnread}>
            {inboxItem.title}
          </StyledInboxItemTitle>
          <StyledInboxItemTimestamp>
            {beautifyPastDateRelativeToNowShort(inboxItem.updatedAt)}
          </StyledInboxItemTimestamp>
        </StyledInboxItemHeader>
        {isNonEmptyString(inboxItem.preview) && (
          <StyledInboxItemPreview>{inboxItem.preview}</StyledInboxItemPreview>
        )}
      </StyledInboxItemContent>
    </StyledInboxItem>
  );
};
