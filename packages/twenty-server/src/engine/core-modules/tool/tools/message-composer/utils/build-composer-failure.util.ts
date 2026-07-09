import { type EmailComposerResult } from 'src/engine/core-modules/tool/tools/email-tool/types/email-composer-result.type';

export const buildComposerFailure = (message: string): EmailComposerResult => ({
  success: false,
  output: {
    success: false,
    message,
    error: message,
  },
});
