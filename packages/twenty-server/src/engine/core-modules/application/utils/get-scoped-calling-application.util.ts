import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';

export const getScopedCallingApplication = <
  TApplication extends Pick<FlatApplication, 'sourceType'>,
>(
  callingApplication: TApplication | null | undefined,
): TApplication | undefined =>
  isDefined(callingApplication) && !isOAuthOnlyApplication(callingApplication)
    ? callingApplication
    : undefined;
