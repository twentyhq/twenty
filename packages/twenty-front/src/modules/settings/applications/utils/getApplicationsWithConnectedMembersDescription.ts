import { type SettingsApplicationsTableApplication } from '@/settings/applications/types/SettingsApplicationsTableApplication';
import { plural } from '@lingui/core/macro';
import { isOAuthOnlyApplication } from '@/settings/applications/utils/isOAuthOnlyApplication';

// An OAuth-only app has nothing installed to describe, so its row says who connected it instead
export const getApplicationsWithConnectedMembersDescription = <
  TApplication extends SettingsApplicationsTableApplication,
>({
  applications,
  connectedMemberCounts,
}: {
  applications: TApplication[];
  connectedMemberCounts: {
    applicationId: string;
    connectedMemberCount: number;
  }[];
}): TApplication[] => {
  const connectedMemberCountByApplicationId = new Map(
    connectedMemberCounts.map(({ applicationId, connectedMemberCount }) => [
      applicationId,
      connectedMemberCount,
    ]),
  );

  return applications.map((application) => {
    if (!isOAuthOnlyApplication(application)) {
      return application;
    }

    const connectedMemberCount =
      connectedMemberCountByApplicationId.get(application.id) ?? 0;

    return {
      ...application,
      description: plural(connectedMemberCount, {
        0: 'No members connected',
        one: 'Connected by # member',
        other: 'Connected by # members',
      }),
    };
  });
};
