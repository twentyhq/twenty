import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { useIcons } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { INBOX_SECTIONS } from '@/inbox/constants/InboxSections';
import { useInboxCounts } from '@/inbox/hooks/useInboxCounts';
import { useInboxQueues } from '@/inbox/hooks/useInboxQueues';
import { getInboxQueuePath } from '@/inbox/utils/getInboxQueuePath';
import { getInboxSectionPath } from '@/inbox/utils/getInboxSectionPath';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { InboxItemScope } from '~/generated/graphql';
import { isMatchingPathname } from '~/utils/isMatchingPathname';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

export const NavigationDrawerInboxContent = () => {
  const { t } = useLingui();
  const location = useLocation();
  const { inboxCounts } = useInboxCounts();
  const { inboxQueues } = useInboxQueues({ isPolling: true });
  const { getIcon } = useIcons();

  const getSectionCount = (scope: InboxItemScope) => {
    switch (scope) {
      case InboxItemScope.INBOX:
        return inboxCounts?.unread ?? 0;
      case InboxItemScope.SNOOZED:
        return inboxCounts?.snoozed ?? 0;
      default:
        return 0;
    }
  };

  return (
    <StyledContainer>
      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label={t`Triage`} />
        {INBOX_SECTIONS.map((inboxSection) => {
          const sectionPath = getInboxSectionPath(inboxSection);
          const count = getSectionCount(inboxSection.scope);

          return (
            <NavigationDrawerItem
              key={inboxSection.slug}
              label={t(inboxSection.label)}
              Icon={inboxSection.Icon}
              to={sectionPath}
              active={isMatchingPathname(location.pathname, `${sectionPath}/*`)}
              secondaryLabel={count > 0 ? String(count) : undefined}
            />
          );
        })}
      </NavigationDrawerSection>
      {/* Shared inboxes sit alongside your own rather than inside it: work in
          them is nobody's until someone takes it. */}
      {inboxQueues.length > 0 && (
        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label={t`Shared`} />
          {inboxQueues.map((inboxQueue) => {
            const queuePath = getInboxQueuePath(inboxQueue.slug);

            return (
              <NavigationDrawerItem
                key={inboxQueue.id}
                label={inboxQueue.name}
                Icon={getIcon(inboxQueue.icon)}
                to={queuePath}
                active={isMatchingPathname(location.pathname, `${queuePath}/*`)}
                secondaryLabel={
                  inboxQueue.unread > 0 ? String(inboxQueue.unread) : undefined
                }
              />
            );
          })}
        </NavigationDrawerSection>
      )}
    </StyledContainer>
  );
};
