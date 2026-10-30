import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { GETTING_STARTED_SMALL_TEAM_MAX_EMPLOYEE_COUNT } from 'src/engine/core-modules/getting-started/constants/getting-started-small-team-max-employee-count.constant';
import { type GettingStartedProfile } from 'src/engine/core-modules/getting-started/types/getting-started-profile.type';
import { isWorkEmail } from 'src/utils/is-work-email';

export const getGettingStartedProfile = ({
  userEmail,
  companyEnrichment,
}: {
  userEmail: string;
  companyEnrichment: WorkspaceCompanyEnrichment | null;
}): GettingStartedProfile => {
  if (!isWorkEmail(userEmail)) {
    return 'PERSONAL';
  }

  const employeeCount = companyEnrichment?.employeeCount;

  return isDefined(employeeCount) &&
    employeeCount <= GETTING_STARTED_SMALL_TEAM_MAX_EMPLOYEE_COUNT
    ? 'SMALL_TEAM'
    : 'TEAM';
};
