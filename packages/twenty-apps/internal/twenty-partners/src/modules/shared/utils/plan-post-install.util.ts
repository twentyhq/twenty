// The release that narrowed the Application RLS predicate to `partnerUser IS me`.
const STRICT_APPLICATION_RLS_VERSION = [1, 6, 1] as const;
// First release that grants opportunity read access to applicants after unlist.
// Later bumps of the same PR (1.8.3 table scoping) must not move this gate, or a
// workspace already on 1.8.2 would re-run the backfill. 1.8.1 still needs it.
const APPLICANT_OPPORTUNITY_VISIBILITY_VERSION = [1, 8, 2] as const;

const isBeforeAppVersion = (
  version: string,
  target: readonly number[],
): boolean => {
  const parts = version.split('.').map((part) => Number.parseInt(part, 10) || 0);

  for (let index = 0; index < target.length; index++) {
    const part = parts[index] ?? 0;
    if (part !== target[index]) return part < target[index];
  }

  return false;
};

export type PostInstallPlan = {
  stampPartnerUser: boolean;
  grantApplicantVisibility: boolean;
};

export const planPostInstall = (
  previousVersion: string | undefined,
): PostInstallPlan => ({
  stampPartnerUser:
    !previousVersion ||
    isBeforeAppVersion(previousVersion, STRICT_APPLICATION_RLS_VERSION),
  grantApplicantVisibility:
    !previousVersion ||
    isBeforeAppVersion(
      previousVersion,
      APPLICANT_OPPORTUNITY_VISIBILITY_VERSION,
    ),
});
