import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { DEFAULT_INBOX_SECTION } from '@/inbox/constants/DefaultInboxSection';
import { INBOX_SUB_SECTIONS } from '@/inbox/constants/InboxSubSections';
import { useInboxCounts } from '@/inbox/hooks/useInboxCounts';
import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
import { getInboxSectionPath } from '@/inbox/utils/getInboxSectionPath';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { InboxItemScope } from '~/generated/graphql';

const INBOX_NAVIGATION_SECTION_ID = 'Inbox';

export const NavigationDrawerInboxSection = () => {
  const { t } = useLingui();
  const location = useLocation();
  const isInboxEnabled = useIsInboxEnabled();
  const { inboxCounts } = useInboxCounts();

  const { toggleNavigationSection } = useNavigationSection(
    INBOX_NAVIGATION_SECTION_ID,
  );
  const isNavigationSectionOpen = useAtomFamilyStateValue(
    isNavigationSectionOpenFamilyState,
    INBOX_NAVIGATION_SECTION_ID,
  );

  if (!isInboxEnabled) {
    return null;
  }

  const inboxPath = getInboxSectionPath(DEFAULT_INBOX_SECTION);
  const selectedSubSectionIndex = INBOX_SUB_SECTIONS.findIndex(
    (inboxSubSection) =>
      location.pathname.startsWith(getInboxSectionPath(inboxSubSection)),
  );

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label={t`Inbox`}
          onClick={toggleNavigationSection}
          isOpen={isNavigationSectionOpen}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
      <AnimatedExpandableContainer
        isExpanded={isNavigationSectionOpen}
        dimension="height"
        mode="fit-content"
        containAnimation
        initial={false}
      >
        <NavigationDrawerItemsCollapsableContainer isGroup>
          <NavigationDrawerItem
            label={t(DEFAULT_INBOX_SECTION.label)}
            Icon={DEFAULT_INBOX_SECTION.Icon}
            to={inboxPath}
            active={location.pathname.startsWith(inboxPath)}
            secondaryLabel={
              (inboxCounts?.unread ?? 0) > 0
                ? String(inboxCounts?.unread)
                : undefined
            }
          />
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
                active={location.pathname.startsWith(subSectionPath)}
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
        </NavigationDrawerItemsCollapsableContainer>
      </AnimatedExpandableContainer>
    </NavigationDrawerSection>
  );
};
