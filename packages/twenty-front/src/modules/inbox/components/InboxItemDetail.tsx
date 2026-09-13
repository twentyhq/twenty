import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronUp,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxItemMarkReadEffect } from '@/inbox/components/InboxItemMarkReadEffect';
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
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
  text-decoration: none;
`;

const StyledPagination = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
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
  const { inboxItem, loading, error } = useInboxItem(inboxItemId);
  const { hasPrevious, hasNext, position, total, goToPrevious, goToNext } =
    useInboxItemPagination({ inboxListLocation, inboxItemId });

  const listPath = isDefined(inboxListLocation.inboxQueueSlug)
    ? getInboxQueuePath(inboxListLocation.inboxQueueSlug)
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
        <StyledPagination>
          {isDefined(position) && isDefined(total) && (
            <span>
              {position} / {total}
            </span>
          )}
          <LightIconButton
            Icon={IconChevronUp}
            accent="secondary"
            aria-label={t`Previous item`}
            disabled={!hasPrevious}
            onClick={goToPrevious}
          />
          <LightIconButton
            Icon={IconChevronDown}
            accent="secondary"
            aria-label={t`Next item`}
            disabled={!hasNext}
            onClick={goToNext}
          />
        </StyledPagination>
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
          <InboxItemView inboxItem={inboxItem} />
        </StyledBody>
      )}
    </StyledDetail>
  );
};
