import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxListRowButtons } from '@/inbox/components/InboxListRowButtons';
import { INBOX_LIST_ROW_PREVIEW_MAX_WIDTH } from '@/inbox/constants/InboxListRowPreviewMaxWidth';
import { INBOX_LIST_ROW_SUBJECT_WIDTH } from '@/inbox/constants/InboxListRowSubjectWidth';
import { type InboxItem, InboxItemPriority } from '~/generated/graphql';
import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';

const StyledRowContainer = styled.div`
  cursor: pointer;
  padding-bottom: 2px;

  &:hover .inbox-list-row-buttons {
    display: flex;
  }

  &:hover .inbox-list-row-updated-at {
    display: none;
  }

  &:hover > div {
    background: ${themeCssVariables.background.transparent.lighter};
  }

  &:active > div {
    background: ${themeCssVariables.accent.quaternary};
  }
`;

const StyledRow = styled.div<{ isSelected: boolean }>`
  align-items: center;
  background: ${({ isSelected }) =>
    isSelected ? themeCssVariables.accent.quaternary : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  height: 32px;
  justify-content: space-between;
  padding: 0 6px;
`;

const StyledSubjectContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  overflow: hidden;
`;

const StyledTitleContainer = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  max-width: ${INBOX_LIST_ROW_SUBJECT_WIDTH}px;
  min-width: 0;
  overflow: hidden;
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
  font-weight: ${({ isUnread }) =>
    isUnread
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPreview = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  max-width: ${INBOX_LIST_ROW_PREVIEW_MAX_WIDTH}px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledUpdatedAt = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
`;

const StyledButtonsSlot = styled.div`
  display: none;
  flex-shrink: 0;
`;

type InboxListRowProps = {
  inboxItem: InboxItem;
  isSelected: boolean;
  onClick: () => void;
  onOpenInSidePanel: () => void;
};

export const InboxListRow = ({
  inboxItem,
  isSelected,
  onClick,
  onOpenInSidePanel,
}: InboxListRowProps) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const InboxItemIcon = getIcon(inboxItem.inboxItemType.icon);
  const isUnread = !isDefined(inboxItem.readAt);
  const needsAction = inboxItem.priority === InboxItemPriority.NEEDS_ACTION;

  return (
    <StyledRowContainer
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
      <StyledRow isSelected={isSelected}>
        <StyledSubjectContainer>
          {isUnread ? <StyledUnreadDot /> : <StyledReadPlaceholder />}
          <StyledTypeIcon needsAction={needsAction}>
            <InboxItemIcon size={theme.icon.size.md} color="currentColor" />
          </StyledTypeIcon>
          <StyledTitleContainer>
            <StyledTitle isUnread={isUnread}>{inboxItem.title}</StyledTitle>
          </StyledTitleContainer>
          {isNonEmptyString(inboxItem.preview) && (
            <StyledPreview>{inboxItem.preview}</StyledPreview>
          )}
        </StyledSubjectContainer>
        <StyledUpdatedAt className="inbox-list-row-updated-at">
          {beautifyPastDateRelativeToNowShort(inboxItem.updatedAt)}
        </StyledUpdatedAt>
        <StyledButtonsSlot className="inbox-list-row-buttons">
          <InboxListRowButtons
            inboxItem={inboxItem}
            onOpenInSidePanel={onOpenInSidePanel}
          />
        </StyledButtonsSlot>
      </StyledRow>
    </StyledRowContainer>
  );
};
