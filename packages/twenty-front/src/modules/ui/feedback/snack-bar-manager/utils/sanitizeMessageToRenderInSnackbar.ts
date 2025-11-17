import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const sanitizeMessageToRenderInSnackbar = (
  messageToRenderInSnackbar: any,
) => {
  if (!isDefined(messageToRenderInSnackbar)) {
    return null;
  } else if (
    typeof messageToRenderInSnackbar === 'string' ||
    typeof messageToRenderInSnackbar === 'string' ||
    typeof messageToRenderInSnackbar === 'boolean'
  ) {
    return `${messageToRenderInSnackbar}`;
  } else if (typeof messageToRenderInSnackbar === 'object') {
    try {
      return JSON.stringify(messageToRenderInSnackbar);
    } catch {
      return t`Cannot display message`;
    }
  } else {
    return t`Cannot display message`;
  }
};
