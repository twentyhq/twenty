import { useQuery } from '@apollo/client/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';

import { GET_ROLES_READING_ALL_CHANNEL_RECORDS } from '@/settings/accounts/graphql/queries/getRolesReadingAllChannelRecords';
import { type RolesReadingAllChannelRecordsQuery } from '~/generated-metadata/graphql';

export const useChannelVisibilityDescription = (
  channelKind: 'message' | 'calendar',
): string => {
  const { t } = useLingui();
  const { data } = useQuery<RolesReadingAllChannelRecordsQuery>(
    GET_ROLES_READING_ALL_CHANNEL_RECORDS,
    { fetchPolicy: 'cache-and-network' },
  );

  const isMessageChannel = channelKind === 'message';
  const rolesReadingAllRecords = isMessageChannel
    ? data?.rolesReadingAllMessages
    : data?.rolesReadingAllCalendarEvents;
  const isAdminRoleIncluded =
    rolesReadingAllRecords?.isAdminRoleIncluded ?? false;
  const otherRoleCount = rolesReadingAllRecords?.otherRoleCount ?? 0;

  if (isAdminRoleIncluded && otherRoleCount > 0 && isMessageChannel) {
    return plural(otherRoleCount, {
      one: `Define what will be visible to other users in your workspace. Admins and ${otherRoleCount} other role can read all your emails, whatever you choose here.`,
      other: `Define what will be visible to other users in your workspace. Admins and ${otherRoleCount} other roles can read all your emails, whatever you choose here.`,
    });
  }

  if (isAdminRoleIncluded && otherRoleCount > 0) {
    return plural(otherRoleCount, {
      one: `Define what will be visible to other users in your workspace. Admins and ${otherRoleCount} other role can see all your events, whatever you choose here.`,
      other: `Define what will be visible to other users in your workspace. Admins and ${otherRoleCount} other roles can see all your events, whatever you choose here.`,
    });
  }

  if (isAdminRoleIncluded && isMessageChannel) {
    return t`Define what will be visible to other users in your workspace. Admins can read all your emails, whatever you choose here.`;
  }

  if (isAdminRoleIncluded) {
    return t`Define what will be visible to other users in your workspace. Admins can see all your events, whatever you choose here.`;
  }

  if (otherRoleCount > 0 && isMessageChannel) {
    return plural(otherRoleCount, {
      one: `Define what will be visible to other users in your workspace. ${otherRoleCount} role can read all your emails, whatever you choose here.`,
      other: `Define what will be visible to other users in your workspace. ${otherRoleCount} roles can read all your emails, whatever you choose here.`,
    });
  }

  if (otherRoleCount > 0) {
    return plural(otherRoleCount, {
      one: `Define what will be visible to other users in your workspace. ${otherRoleCount} role can see all your events, whatever you choose here.`,
      other: `Define what will be visible to other users in your workspace. ${otherRoleCount} roles can see all your events, whatever you choose here.`,
    });
  }

  return t`Define what will be visible to other users in your workspace`;
};
