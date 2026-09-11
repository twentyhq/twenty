import { isDefined } from 'twenty-shared/utils';

// The workspace's own application owns what users create in it; anything
// else is managed by an installed application.
export const isOwnedByInstalledApplication = ({
  applicationId,
  workspaceCustomApplicationId,
}: {
  applicationId?: string | null;
  workspaceCustomApplicationId?: string | null;
}): boolean =>
  isDefined(applicationId) && applicationId !== workspaceCustomApplicationId;
