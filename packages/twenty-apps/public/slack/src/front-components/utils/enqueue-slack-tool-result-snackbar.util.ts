import { isNonEmptyString } from '@sniptt/guards';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';

export const enqueueSlackToolResultSnackbar = (result: SlackToolResult) => {
  enqueueSnackbar({
    message: isNonEmptyString(result.error) ? result.error : result.message,
    variant: result.success ? 'success' : 'error',
  });
};
