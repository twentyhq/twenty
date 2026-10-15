import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';

export const isInstalledApplication = ({
  application,
  workspaceCustomApplicationId,
}: {
  application:
    | Pick<FlatApplication, 'id' | 'universalIdentifier' | 'sourceType'>
    | null
    | undefined;
  workspaceCustomApplicationId: string | null | undefined;
}): boolean => {
  const scopedApplication = getScopedCallingApplication(application);

  return (
    isDefined(scopedApplication) &&
    scopedApplication.universalIdentifier !==
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER &&
    scopedApplication.id !== workspaceCustomApplicationId
  );
};
