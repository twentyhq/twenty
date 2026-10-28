import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { type Application } from '~/generated-metadata/graphql';
import { CUSTOM_APPLICATION_ILLUSTRATIONS } from '@/settings/applications/constants/CustomApplicationIllustrations';
import { STANDARD_APPLICATION_ILLUSTRATIONS } from '@/settings/applications/constants/StandardApplicationIllustrations';

type GetApplicationCoverImageUrlArgs = {
  application?: Pick<Application, 'id' | 'universalIdentifier'> | null;
  currentWorkspace: CurrentWorkspace | null;
  galleryImages?: string[] | null;
};

export const getApplicationCoverImageUrl = ({
  application,
  currentWorkspace,
  galleryImages,
}: GetApplicationCoverImageUrlArgs) => {
  if (isNonEmptyArray(galleryImages)) {
    return galleryImages[0];
  }

  if (isTwentyStandardApplication(application)) {
    return STANDARD_APPLICATION_ILLUSTRATIONS[0];
  }

  if (isWorkspaceCustomApplication(application, currentWorkspace)) {
    return CUSTOM_APPLICATION_ILLUSTRATIONS[0];
  }

  return undefined;
};
