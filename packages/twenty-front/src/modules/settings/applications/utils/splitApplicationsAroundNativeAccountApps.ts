import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';

export const splitApplicationsAroundNativeAccountApps = <
  TApplication extends { universalIdentifier?: string | null },
>({
  applications,
  hasNativeAccountApps,
}: {
  applications: TApplication[];
  hasNativeAccountApps: boolean;
}): {
  applicationsBeforeNativeAccountApps: TApplication[];
  applicationsAfterNativeAccountApps: TApplication[];
} => {
  if (!hasNativeAccountApps) {
    return {
      applicationsBeforeNativeAccountApps: [],
      applicationsAfterNativeAccountApps: applications,
    };
  }

  return {
    applicationsBeforeNativeAccountApps: applications.filter(
      isTwentyStandardApplication,
    ),
    applicationsAfterNativeAccountApps: applications.filter(
      (application) => !isTwentyStandardApplication(application),
    ),
  };
};
