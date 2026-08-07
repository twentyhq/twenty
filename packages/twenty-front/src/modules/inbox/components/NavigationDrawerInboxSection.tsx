import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { INBOX_SECTIONS } from '@/inbox/constants/InboxSections';
import { useInboxCounts } from '@/inbox/hooks/useInboxCounts';
import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
import { getInboxSectionPath } from '@/inbox/utils/getInboxSectionPath';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
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

  const getSectionCount = (scope: InboxItemScope) => {
    if (scope === InboxItemScope.INBOX) {
      return inboxCounts?.unread;
    }

    if (scope === InboxItemScope.SNOOZED) {
      return inboxCounts?.snoozed;
    }

    return undefined;
  };

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
        {INBOX_SECTIONS.map((inboxSection) => {
          const sectionPath = getInboxSectionPath(inboxSection);
          const sectionCount = getSectionCount(inboxSection.scope);

          return (
            <NavigationDrawerItem
              key={inboxSection.slug}
              label={t(inboxSection.label)}
              Icon={inboxSection.Icon}
              to={sectionPath}
              active={location.pathname === sectionPath}
              secondaryLabel={
                sectionCount !== undefined && sectionCount > 0
                  ? String(sectionCount)
                  : undefined
              }
            />
          );
        })}
      </AnimatedExpandableContainer>
    </NavigationDrawerSection>
  );
};
