import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  IconChevronUp,
  IconLayoutSidebarRightExpand,
  useIcons,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxItemActions } from '@/inbox/components/InboxItemActions';
import { InboxItemSubject } from '@/inbox/components/InboxItemSubject';
import { useInboxItem } from '@/inbox/hooks/useInboxItem';
import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { useInboxItemPagination } from '@/inbox/hooks/useInboxItemPagination';
import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
import { useOpenInboxItemInSidePanel } from '@/inbox/hooks/useOpenInboxItemInSidePanel';
import { findInboxSectionBySlug } from '@/inbox/utils/findInboxSectionBySlug';
import { getInboxSectionPath } from '@/inbox/utils/getInboxSectionPath';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';

const StyledBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledContext = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledTypeLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.h1`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledPreview = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledOutcome = styled.div`
  align-self: flex-start;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledPagination = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledMissing = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
  padding: ${themeCssVariables.spacing[10]};
`;

export const InboxItemPage = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { inboxSectionSlug, inboxItemId } = useParams<{
    inboxSectionSlug?: string;
    inboxItemId?: string;
  }>();

  const isInboxEnabled = useIsInboxEnabled();
  const inboxSection = findInboxSectionBySlug(inboxSectionSlug);
  const { inboxItem, loading } = useInboxItem(inboxItemId);
  const { markInboxItemRead } = useInboxItemActions();
  const { openInboxItemInSidePanel } = useOpenInboxItemInSidePanel();
  const { getIcon } = useIcons();

  const { hasPrevious, hasNext, position, total, goToPrevious, goToNext } =
    useInboxItemPagination({ inboxSection, inboxItemId });

  const isUnread = isDefined(inboxItem) && !isDefined(inboxItem.readAt);

  useEffect(() => {
    if (isUnread && isDefined(inboxItemId)) {
      void markInboxItemRead({ inboxItemId });
    }
  }, [isUnread, inboxItemId, markInboxItemRead]);

  if (!isInboxEnabled) {
    return <Navigate to={AppPath.Index} replace />;
  }

  if (!isDefined(inboxItem)) {
    return (
      <PageCardLayout
        header={
          <PageCardHeader
            icon={<inboxSection.Icon size={theme.icon.size.md} />}
            title={t(inboxSection.label)}
          />
        }
      >
        <StyledMissing>
          {loading ? t`Loading` : t`This item is no longer in your inbox`}
        </StyledMissing>
      </PageCardLayout>
    );
  }

  const InboxItemIcon = getIcon(inboxItem.inboxItemType.icon);
  const outcomeLabel = inboxItem.inboxItemType.outcomes.find(
    (outcome) => outcome.key === inboxItem.outcome,
  )?.label;

  return (
    <PageCardLayout
      header={
        <PageCardHeader
          icon={<inboxSection.Icon size={theme.icon.size.md} />}
          links={[
            {
              children: t(inboxSection.label),
              href: getInboxSectionPath(inboxSection),
            },
            { children: inboxItem.title },
          ]}
          actionButton={
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
              <LightIconButton
                Icon={IconLayoutSidebarRightExpand}
                accent="secondary"
                aria-label={t`Open in side panel`}
                onClick={() => openInboxItemInSidePanel(inboxItem)}
              />
            </StyledPagination>
          }
        />
      }
    >
      <StyledBody>
        <StyledContext>
          <StyledTypeLabel>
            <InboxItemIcon size={theme.icon.size.sm} color="currentColor" />
            {inboxItem.inboxItemType.label}
          </StyledTypeLabel>
          <StyledTitle>{inboxItem.title}</StyledTitle>
          {isNonEmptyString(inboxItem.preview) && (
            <StyledPreview>{inboxItem.preview}</StyledPreview>
          )}
          {isDefined(inboxItem.outcome) && (
            <StyledOutcome>{outcomeLabel ?? inboxItem.outcome}</StyledOutcome>
          )}
          <InboxItemActions inboxItem={inboxItem} />
        </StyledContext>
        <InboxItemSubject inboxItem={inboxItem} />
      </StyledBody>
    </PageCardLayout>
  );
};
