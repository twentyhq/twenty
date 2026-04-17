import { isNonEmptyString } from '@sniptt/guards';

export const isCustomOrUnsavedPageLayoutEntity = ({
  applicationId,
  workspaceCustomApplicationId,
}: {
  applicationId: string | null | undefined;
  workspaceCustomApplicationId: string | undefined;
}): boolean => {
  if (!isNonEmptyString(applicationId)) {
    return true;
  }

  return applicationId === workspaceCustomApplicationId;
};
