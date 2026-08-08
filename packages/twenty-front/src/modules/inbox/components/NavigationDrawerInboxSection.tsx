import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { useIcons } from 'twenty-ui/icon';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { DEFAULT_INBOX_SECTION } from '@/inbox/constants/DefaultInboxSection';
import { INBOX_SUB_SECTIONS } from '@/inbox/constants/InboxSubSections';
import { useInboxCounts } from '@/inbox/hooks/useInboxCounts';
import { useInboxQueues } from '@/inbox/hooks/useInboxQueues';
import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
import { INBOX_ROOT_PATH } from '@/inbox/constants/InboxRootPath';
import { getInboxQueuePath } from '@/inbox/utils/getInboxQueuePath';
import { getInboxSectionPath } from '@/inbox/utils/getInboxSectionPath';
import { isInboxSectionActive } from '@/inbox/utils/isInboxSectionActive';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { InboxItemScope } from '~/generated/graphql';

// The collapsed drawer constrains its group to a narrow rail, which would clip
// the nested rows while they animate open. Folder navigation opts out the same
// way.
const StyledExpandableWrapper = styled.div`
  & > div {
    overflow: visible !important;
  }
`;

export const NavigationDrawerInboxSection = () => {
  const { t } = useLingui();
  const location = useLocation();
  const isInboxEnabled = useIsInboxEnabled();
  const { inboxCounts } = useInboxCounts();
  const { inboxQueues } = useInboxQueues();
  const { getIcon } = useIcons();

  if (!isInboxEnabled) {
    return null;
  }

  const inboxPath = getInboxSectionPath(DEFAULT_INBOX_SECTION);
  // Snoozed and Done are somewhere you go once you are in the inbox, so they
  // stay out of the way until you are
  const isInboxSurfaceActive = isInboxSectionActive({
    pathname: location.pathname,
    inboxSectionPath: INBOX_ROOT_PATH,
  });
  const selectedSubSectionIndex = INBOX_SUB_SECTIONS.findIndex(
    (inboxSubSection) =>
      isInboxSectionActive({
        pathname: location.pathname,
        inboxSectionPath: getInboxSectionPath(inboxSubSection),
      }),
  );

  return (
    <NavigationDrawerSection>
      <NavigationDrawerItemsCollapsableContainer isGroup>
        <NavigationDrawerItem
          label={t(DEFAULT_INBOX_SECTION.label)}
          Icon={DEFAULT_INBOX_SECTION.Icon}
          to={inboxPath}
          active={isInboxSectionActive({
            pathname: location.pathname,
            inboxSectionPath: inboxPath,
          })}
          secondaryLabel={
            (inboxCounts?.unread ?? 0) > 0
              ? String(inboxCounts?.unread)
              : undefined
          }
        />
        <StyledExpandableWrapper>
          <AnimatedExpandableContainer
            isExpanded={isInboxSurfaceActive}
            dimension="height"
            mode="fit-content"
            containAnimation
            initial={false}
          >
            {INBOX_SUB_SECTIONS.map((inboxSubSection, index) => {
              const subSectionPath = getInboxSectionPath(inboxSubSection);
              const snoozedCount =
                inboxSubSection.scope === InboxItemScope.SNOOZED
                  ? inboxCounts?.snoozed
                  : undefined;

              return (
                <NavigationDrawerSubItem
                  key={inboxSubSection.slug}
                  label={t(inboxSubSection.label)}
                  Icon={inboxSubSection.Icon}
                  to={subSectionPath}
                  active={isInboxSectionActive({
                    pathname: location.pathname,
                    inboxSectionPath: subSectionPath,
                  })}
                  subItemState={getNavigationSubItemLeftAdornment({
                    index,
                    arrayLength: INBOX_SUB_SECTIONS.length,
                    selectedIndex: selectedSubSectionIndex,
                  })}
                  secondaryLabel={
                    (snoozedCount ?? 0) > 0 ? String(snoozedCount) : undefined
                  }
                />
              );
            })}
          </AnimatedExpandableContainer>
        </StyledExpandableWrapper>
      </NavigationDrawerItemsCollapsableContainer>
      {/* Shared inboxes sit alongside your own rather than inside it: work in
          them is nobody's until someone takes it. */}
      {inboxQueues.length > 0 && (
        <>
          <NavigationDrawerSectionTitle label={t`Shared`} />
          {inboxQueues.map((inboxQueue) => {
            const queuePath = getInboxQueuePath(inboxQueue.slug);

            return (
              <NavigationDrawerItem
                key={inboxQueue.id}
                label={inboxQueue.name}
                Icon={getIcon(inboxQueue.icon)}
                to={queuePath}
                active={isInboxSectionActive({
                  pathname: location.pathname,
                  inboxSectionPath: queuePath,
                })}
                secondaryLabel={
                  inboxQueue.unread > 0 ? String(inboxQueue.unread) : undefined
                }
              />
            );
          })}
        </>
      )}
    </NavigationDrawerSection>
  );
};
