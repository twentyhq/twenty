import { isDefined } from 'twenty-shared/utils';

export const isOwnedByInstalledApplication = ({
  applicationId,
  workspaceCustomApplicationId,
}: {
  applicationId?: string | null;
  workspaceCustomApplicationId?: string | null;
}): boolean =>
  isDefined(applicationId) && applicationId !== workspaceCustomApplicationId;
