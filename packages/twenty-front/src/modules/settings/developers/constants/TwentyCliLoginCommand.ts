import { doNotTranslate } from 'twenty-shared/i18n';

import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const TWENTY_CLI_LOGIN_COMMAND = doNotTranslate(
  `npx twenty@latest auth login --url ${REACT_APP_SERVER_BASE_URL} --use`,
);
