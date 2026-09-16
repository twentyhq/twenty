import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxItemMarkReadEffect } from '@/inbox/components/InboxItemMarkReadEffect';
import { InboxItemPlacement } from '@/inbox/components/InboxItemPlacement';
import { InboxItemView } from '@/inbox/components/InboxItemView';
import { useInboxItem } from '@/inbox/hooks/useInboxItem';
import { useInboxItemPagination } from '@/inbox/hooks/useInboxItemPagination';
import { type InboxListLocation } from '@/inbox/types/InboxListLocation';
import { getInboxQueuePath } from '@/inbox/utils/getInboxQueuePath';
import { SIDE_PANEL_TOP_BAR_HEIGHT } from '@/side-panel/constants/SidePanelTopBarHeight';

const StyledDetail = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledTopBar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
  min-height: ${SIDE_PANEL_TOP_BAR_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledBackLink = styled(Link)`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
  text-decoration: none;
`;

const StyledTitle = styled.h1`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  margin: 0;
  min-width: 0;
`;

const StyledTitleIcon = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  display: inline-flex;
  flex-shrink: 0;
`;

const StyledTitleText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPlacementSlot = styled.div`
  flex-shrink: 0;
  margin-left: auto;
`;

const StyledBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledPlaceholder = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
  padding: ${themeCssVariables.spacing[10]};
`;

type InboxItemDetailProps = {
  inboxItemId?: string;
  inboxListLocation: InboxListLocation;
  listTitle: string;
  showBackToList: boolean;
};

export const InboxItemDetail = ({
  inboxItemId,
  inboxListLocation,
  listTitle,
  showBackToList,
}: InboxItemDetailProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const { inboxItem, loading, error } = useInboxItem(inboxItemId);
  // The list moves on after a send the way a mail client does, so the next
  // item is still resolved even though the bar no longer offers to step.
  const { hasNext, goToNext } = useInboxItemPagination({
    inboxListLocation,
    inboxItemId,
  });
  const InboxItemTypeIcon = getIcon(inboxItem?.inboxItemType.icon);

  const listPath = isDefined(inboxListLocation.inboxQueueName)
    ? getInboxQueuePath(inboxListLocation.inboxQueueName)
    : getAppPath(AppPath.InboxSectionPage, {
        inboxSectionSlug: inboxListLocation.inboxSectionSlug ?? '',
      });

  if (!isDefined(inboxItemId)) {
    return (
      <StyledDetail>
        <StyledTopBar />
        <StyledPlaceholder>{t`Pick an item to see it here`}</StyledPlaceholder>
      </StyledDetail>
    );
  }

  return (
    <StyledDetail>
      <StyledTopBar>
        {showBackToList && (
          <StyledBackLink to={listPath}>
            <IconChevronLeft size={theme.icon.size.md} />
            {listTitle}
          </StyledBackLink>
        )}
        {isDefined(inboxItem) && (
          <>
            <StyledTitle title={inboxItem.title}>
              <StyledTitleIcon aria-label={inboxItem.inboxItemType.label}>
                <InboxItemTypeIcon
                  size={theme.icon.size.sm}
                  color="currentColor"
                />
              </StyledTitleIcon>
              <StyledTitleText>{inboxItem.title}</StyledTitleText>
            </StyledTitle>
            <StyledPlacementSlot>
              <InboxItemPlacement inboxItem={inboxItem} />
            </StyledPlacementSlot>
          </>
        )}
      </StyledTopBar>
      {!isDefined(inboxItem) ? (
        <StyledPlaceholder>
          {loading
            ? t`Loading`
            : isDefined(error)
              ? t`This item could not be loaded`
              : t`This item is no longer in your inbox`}
        </StyledPlaceholder>
      ) : (
        <StyledBody>
          <InboxItemMarkReadEffect
            inboxItemId={inboxItem.id}
            isUnread={inboxItem.isUnread}
          />
          <InboxItemView
            inboxItem={inboxItem}
            onItemCompleted={hasNext ? goToNext : undefined}
          />
        </StyledBody>
      )}
    </StyledDetail>
  );
};
