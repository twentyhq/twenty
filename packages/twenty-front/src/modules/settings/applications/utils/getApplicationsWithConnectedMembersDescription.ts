import { type SettingsApplicationsTableApplication } from '@/settings/applications/types/SettingsApplicationsTableApplication';
import { plural } from '@lingui/core/macro';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';

// An OAuth-only app has nothing installed to describe, so its row says who connected it instead
export const getApplicationsWithConnectedMembersDescription = <
  TApplication extends SettingsApplicationsTableApplication,
>({
  applications,
  applicationAuthorizations,
}: {
  applications: TApplication[];
  applicationAuthorizations: { applicationId: string }[];
}): TApplication[] => {
  const connectedMemberCountByApplicationId = new Map<string, number>();

  for (const { applicationId } of applicationAuthorizations) {
    connectedMemberCountByApplicationId.set(
      applicationId,
      (connectedMemberCountByApplicationId.get(applicationId) ?? 0) + 1,
    );
  }

  return applications.map((application) => {
    if (
      application.applicationRegistration?.sourceType !==
      ApplicationRegistrationSourceType.OAUTH_ONLY
    ) {
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
