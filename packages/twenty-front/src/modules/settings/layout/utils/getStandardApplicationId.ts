import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

export const getStandardApplicationId = (
  workspace: CurrentWorkspace | null,
): string | null =>
  workspace?.installedApplications.find(
    (application) =>
      application.universalIdentifier ===
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  )?.id ?? null;
