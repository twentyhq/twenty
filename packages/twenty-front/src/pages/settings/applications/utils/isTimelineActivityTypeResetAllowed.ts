import { isDefined } from 'twenty-shared/utils';

export const isTimelineActivityTypeResetAllowed = ({
  applicationId,
  workspaceCustomApplicationId,
}: {
  applicationId: string;
  workspaceCustomApplicationId?: string;
}) =>
  isDefined(workspaceCustomApplicationId) &&
  workspaceCustomApplicationId !== applicationId;
