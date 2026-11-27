import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { AGENT_CHAT_THREAD_PRESET_FILTER } from 'twenty-shared/ai';

import { NavigationDrawerInboxTriageItem } from '@/inbox/components/NavigationDrawerInboxTriageItem';
import { INBOX_TRIAGE_NAVIGATION_SECTION_ID } from '@/inbox/constants/InboxTriageNavigationSectionId';
import { useInboxOpenThreadsSummary } from '@/inbox/hooks/useInboxOpenThreadsSummary';
import { NavigationMenuSectionSeeMore } from '@/navigation-menu-item/display/sections/components/NavigationMenuSectionSeeMore';
import { StyledNavigationMenuSectionHiddenItems } from '@/navigation-menu-item/display/sections/components/StyledNavigationMenuSectionHiddenItems';
import { getNavigationSectionVisibleItems } from '@/navigation-menu-item/display/utils/getNavigationSectionVisibleItems';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';

const INBOX_TRIAGE_PRESET_FILTERS = [
  AGENT_CHAT_THREAD_PRESET_FILTER.OPEN,
  AGENT_CHAT_THREAD_PRESET_FILTER.SNOOZED,
  AGENT_CHAT_THREAD_PRESET_FILTER.DONE,
];

type NavigationDrawerInboxTriageSectionProps = {
  label?: string;
  visibleItemLimit?: number | null;
  headerAction?: ReactNode;
};

export const NavigationDrawerInboxTriageSection = ({
  label,
  visibleItemLimit,
  headerAction,
}: NavigationDrawerInboxTriageSectionProps) => {
  const { t } = useLingui();
  const { openThreadCount, hasUnreadOpenThread } = useInboxOpenThreadsSummary();
  const {
    visibleItems: visiblePresetFilters,
    hiddenItems: hiddenPresetFilters,
    hasHiddenItems,
  } = getNavigationSectionVisibleItems({
    items: INBOX_TRIAGE_PRESET_FILTERS,
    visibleItemLimit,
  });

  const renderPresetFilter = (
    presetFilter: (typeof INBOX_TRIAGE_PRESET_FILTERS)[number],
  ) => {
    const isOpenPresetFilter =
      presetFilter === AGENT_CHAT_THREAD_PRESET_FILTER.OPEN;

    return (
      <NavigationDrawerInboxTriageItem
        key={presetFilter}
        presetFilter={presetFilter}
        count={isOpenPresetFilter ? openThreadCount : undefined}
        isUnread={isOpenPresetFilter ? hasUnreadOpenThread : undefined}
      />
    );
  };

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={INBOX_TRIAGE_NAVIGATION_SECTION_ID}
      label={label ?? t`Triage`}
      rightIcon={headerAction}
      alwaysShowRightIcon={isDefined(headerAction)}
    >
      {visiblePresetFilters.map(renderPresetFilter)}
      {hasHiddenItems && (
        <NavigationMenuSectionSeeMore
          sectionId={INBOX_TRIAGE_NAVIGATION_SECTION_ID}
          hiddenItems={
            <StyledNavigationMenuSectionHiddenItems>
              {hiddenPresetFilters.map(renderPresetFilter)}
            </StyledNavigationMenuSectionHiddenItems>
          }
        />
      )}
    </CollapsibleNavigationDrawerSection>
  );
};
