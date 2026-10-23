import { LinkActivitiesDropdown } from '@/activities/components/LinkActivitiesDropdown';
import { getTimelineThreadsFromObjectRecord } from '@/activities/emails/graphql/queries/getTimelineThreadsFromObjectRecord';
import { searchTimelineThreads } from '@/activities/emails/graphql/queries/searchTimelineThreads';
import { getEmailParticipantAvatarColorSeed } from '@/activities/emails/utils/getEmailParticipantAvatarColorSeed';
import { getTimelineThreadLabel } from '@/activities/emails/utils/getTimelineThreadLabel';
import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { Avatar } from 'twenty-ui/primitives/data-display';
import {
  type SearchTimelineThreadsQuery,
  type TimelineThread,
} from '~/generated/graphql';
import { formatToHumanReadableDate } from '~/utils/date-utils';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type LinkEmailThreadsDropdownProps = {
  dropdownIdPrefix: string;
  trigger: ReactElement;
};

export const LinkEmailThreadsDropdown = ({
  dropdownIdPrefix,
  trigger,
}: LinkEmailThreadsDropdownProps) => {
  const { t } = useLingui();

  return (
    <LinkActivitiesDropdown<TimelineThread, SearchTimelineThreadsQuery>
      activityObjectNameSingular={CoreObjectNameSingular.MessageThread}
      dropdownIdPrefix={dropdownIdPrefix}
      ariaLabel={t`Link email threads`}
      trigger={trigger}
      searchQuery={searchTimelineThreads}
      getSearchResults={(data) => ({
        recordActivities: data.searchTimelineThreads.recordTimelineThreads,
        otherActivities: data.searchTimelineThreads.otherTimelineThreads,
      })}
      timelineQuery={getTimelineThreadsFromObjectRecord}
      getOption={(thread) => ({
        label: getTimelineThreadLabel(thread),
        description: formatToHumanReadableDate(thread.lastMessageReceivedAt),
        startIcon: (
          <Avatar
            src={getAbsoluteImageUrl(thread.firstParticipant.avatarUrl)}
            name={thread.firstParticipant.displayName}
            colorSeed={getEmailParticipantAvatarColorSeed(
              thread.firstParticipant,
            )}
            shape="circle"
            size="sm"
          />
        ),
      })}
      labels={{
        search: t`Search email threads`,
        loading: t`Loading email threads`,
        empty: t`No email threads found`,
        otherSection: t`Your other email threads`,
      }}
    />
  );
};
