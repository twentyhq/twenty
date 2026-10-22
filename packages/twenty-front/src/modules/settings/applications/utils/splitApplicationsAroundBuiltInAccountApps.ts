import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';

export const splitApplicationsAroundBuiltInAccountApps = <
  TApplication extends { universalIdentifier?: string | null },
>({
  applications,
  hasBuiltInAccountApps,
}: {
  applications: TApplication[];
  hasBuiltInAccountApps: boolean;
}): {
  applicationsBeforeBuiltInAccountApps: TApplication[];
  applicationsAfterBuiltInAccountApps: TApplication[];
} => {
  if (!hasBuiltInAccountApps) {
    return {
      applicationsBeforeBuiltInAccountApps: [],
      applicationsAfterBuiltInAccountApps: applications,
    };
  }

  return {
    applicationsBeforeBuiltInAccountApps: applications.filter(
      isTwentyStandardApplication,
    ),
    applicationsAfterBuiltInAccountApps: applications.filter(
      (application) => !isTwentyStandardApplication(application),
    ),
  };
};
