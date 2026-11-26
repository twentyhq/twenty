import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Badge } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  AGENT_CHAT_THREAD_PRESET_FILTER,
  type AgentChatThreadPresetFilter,
} from 'twenty-shared/ai';

import { INBOX_THREAD_PRESET_FILTER_ICONS } from '@/inbox/constants/InboxThreadPresetFilterIcons';
import { INBOX_THREAD_PRESET_FILTER_LABELS } from '@/inbox/constants/InboxThreadPresetFilterLabels';
import { INBOX_INSTANCE_ID } from '@/inbox/constants/InboxInstanceId';
import { useOpenInboxPresetFilter } from '@/inbox/hooks/useOpenInboxPresetFilter';
import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { isInboxOpenThreadPresetFilter } from '@/inbox/utils/isInboxOpenThreadPresetFilter';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isInboxPath } from '~/utils/isInboxPath';
import { NavigationMenuTabFirstItemOpenEffect } from '@/navigation-menu-item/display/effect-components/NavigationMenuTabFirstItemOpenEffect';

const StyledCount = styled.span`
  display: flex;
  padding-right: ${themeCssVariables.spacing['1.5']};
`;

type NavigationDrawerInboxTriageItemProps = {
  presetFilter: AgentChatThreadPresetFilter;
  count?: number;
  isUnread?: boolean;
};

export const NavigationDrawerInboxTriageItem = ({
  presetFilter,
  count,
  isUnread,
}: NavigationDrawerInboxTriageItemProps) => {
  const { t } = useLingui();
  const location = useLocation();
  const inboxSelectedThreadListSource = useAtomStateValue(
    inboxSelectedThreadListSourceState,
  );
  const { openInboxPresetFilter } = useOpenInboxPresetFilter(INBOX_INSTANCE_ID);
  const isCurrentFilter =
    inboxSelectedThreadListSource.type === 'presetFilter' &&
    (inboxSelectedThreadListSource.presetFilter === presetFilter ||
      (presetFilter === AGENT_CHAT_THREAD_PRESET_FILTER.OPEN &&
        isInboxOpenThreadPresetFilter(
          inboxSelectedThreadListSource.presetFilter,
        )));
  const hasCount = isDefined(count) && count > 0;

  return (
    <>
      <NavigationMenuTabFirstItemOpenEffect
        onOpen={() => openInboxPresetFilter(presetFilter)}
      />
      <NavigationDrawerItem
        label={t(INBOX_THREAD_PRESET_FILTER_LABELS[presetFilter])}
        isUnread={isUnread}
        Icon={INBOX_THREAD_PRESET_FILTER_ICONS[presetFilter]}
        active={isInboxPath(location.pathname) && isCurrentFilter}
        onClick={() => openInboxPresetFilter(presetFilter)}
        triggerEvent="CLICK"
        rightOptions={
          hasCount ? (
            <StyledCount>
              <Badge>{count}</Badge>
            </StyledCount>
          ) : undefined
        }
        alwaysShowRightOptions={hasCount}
      />
    </>
  );
};
