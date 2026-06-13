import { i18n } from '@lingui/core';
import { compileMessage } from '@lingui/message-utils/compileMessage';

// Lingui 5.9+ throws when a translation function runs without an active
// locale. Production activates the global singleton in I18nService; unit
// tests bypass Nest bootstrap, so mirror that here. The messages compiler
// makes t`...` fall back to the English source text.
i18n.setMessagesCompiler(compileMessage);
i18n.load('en', {});
i18n.activate('en');

declare global {
  namespace jest {
    interface Matchers<R> {
      toThrowError(error?: string | RegExp | Error): R;
      toBeCalledTimes(expected: number): R;
    }
  }
}
