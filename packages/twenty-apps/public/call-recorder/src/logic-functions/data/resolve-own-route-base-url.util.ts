import { TWENTY_FUNCTIONS_URL_ENV_VAR_NAME } from 'src/constants/twenty-functions-url-env-var-name';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const resolveOwnRouteBaseUrl = (): string => {
  const injectedFunctionsUrl = process.env[TWENTY_FUNCTIONS_URL_ENV_VAR_NAME];

  if (!isNonEmptyString(injectedFunctionsUrl)) {
    throw new Error(
      `Unable to resolve Call Recorder own route target without ${TWENTY_FUNCTIONS_URL_ENV_VAR_NAME}`,
    );
  }

  return injectedFunctionsUrl;
};
