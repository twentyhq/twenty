import { WORKSPACE_CUSTOM_APPLICATION_DEPENDENCIES_DIRECTORY_NAME } from 'src/engine/core-modules/application/application-package/constants/workspace-custom-application-dependencies-directory-name';
import {
  type DefaultApplicationPackageFields,
  getDefaultApplicationPackageFields,
} from 'src/engine/core-modules/application/application-package/utils/get-default-application-package-fields.util';

export const getDefaultApplicationPackageFieldsForApplication = ({
  applicationId,
  workspaceCustomApplicationId,
}: {
  applicationId: string;
  workspaceCustomApplicationId?: string | null;
}): Promise<DefaultApplicationPackageFields> =>
  getDefaultApplicationPackageFields({
    directory:
      applicationId === workspaceCustomApplicationId
        ? WORKSPACE_CUSTOM_APPLICATION_DEPENDENCIES_DIRECTORY_NAME
        : undefined,
  });
