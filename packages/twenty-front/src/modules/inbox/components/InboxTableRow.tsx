import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { INBOX_TABLE_GRID_TEMPLATE_COLUMNS } from '@/inbox/constants/InboxTableGridTemplateColumns';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type InboxItem, InboxItemPriority } from '~/generated/graphql';
import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';

const StyledTypeIcon = styled.div<{ $needsAction: boolean }>`
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

const StyledTitle = styled.div<{ $isUnread: boolean }>`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${({ $isUnread }) =>
    $isUnread
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.regular};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPreview = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTypeLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type InboxTableRowProps = {
  inboxItem: InboxItem;
  isSelected: boolean;
  onClick: () => void;
};

export const InboxTableRow = ({
  inboxItem,
  isSelected,
  onClick,
}: InboxTableRowProps) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const InboxItemIcon = getIcon(inboxItem.inboxItemType.icon);
  const isUnread = !isDefined(inboxItem.readAt);
  const needsAction = inboxItem.priority === InboxItemPriority.NEEDS_ACTION;

  return (
    <TableRow
      gridTemplateColumns={INBOX_TABLE_GRID_TEMPLATE_COLUMNS}
      isSelected={isSelected}
      isClickable
      onClick={onClick}
    >
      <TableCell>
        {isUnread ? <StyledUnreadDot /> : <StyledReadPlaceholder />}
      </TableCell>
      <TableCell>
        <StyledTypeIcon $needsAction={needsAction}>
          <InboxItemIcon size={theme.icon.size.sm} color="currentColor" />
        </StyledTypeIcon>
      </TableCell>
      <TableCell overflow="hidden">
        <StyledTypeLabel>{inboxItem.inboxItemType.label}</StyledTypeLabel>
      </TableCell>
      <TableCell overflow="hidden">
        <StyledTitle $isUnread={isUnread}>{inboxItem.title}</StyledTitle>
      </TableCell>
      <TableCell overflow="hidden">
        {isNonEmptyString(inboxItem.preview) && (
          <StyledPreview>{inboxItem.preview}</StyledPreview>
        )}
      </TableCell>
      <TableCell align="right" color={themeCssVariables.font.color.tertiary}>
        {beautifyPastDateRelativeToNowShort(inboxItem.updatedAt)}
      </TableCell>
    </TableRow>
  );
};
