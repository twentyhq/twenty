import { doNotTranslate } from 'twenty-shared/i18n';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { CaptchaDriverType } from '~/generated-metadata/graphql';

const CAPTCHA_WIDGET_SELECTOR = '#captcha-widget';

export const requestCaptchaTokenFromProvider = ({
  provider,
  siteKey,
  abortSignal,
}: {
  provider: CaptchaDriverType;
  siteKey: string;
  abortSignal: AbortSignal;
}): Promise<string> => {
  switch (provider) {
    case CaptchaDriverType.GOOGLE_RECAPTCHA:
      return Promise.resolve(
        window.grecaptcha.execute(siteKey, { action: 'submit' }),
      );
    case CaptchaDriverType.TURNSTILE:
      return new Promise<string>((resolve, reject) => {
        const widgetRoot = document.querySelector(CAPTCHA_WIDGET_SELECTOR);

        if (!isDefined(widgetRoot)) {
          reject(
            new Error(doNotTranslate('Captcha widget container is missing')),
          );
          return;
        }

        // Turnstile rejects a second render in a container that already holds a widget
        const container = document.createElement('div');

        widgetRoot.appendChild(container);

        let widgetId: string | undefined;

        const removeWidget = () => {
          abortSignal.removeEventListener('abort', handleAbort);

          if (isDefined(widgetId)) {
            window.turnstile.remove(widgetId);
          }
          container.remove();
        };

        const handleAbort = () => {
          removeWidget();
          reject(new Error(doNotTranslate('Turnstile challenge aborted')));
        };

        abortSignal.addEventListener('abort', handleAbort, { once: true });

        widgetId = window.turnstile.render(container, {
          sitekey: siteKey,
          callback: (token: string) => {
            removeWidget();
            resolve(token);
          },
          'error-callback': (errorCode: string) => {
            removeWidget();
            reject(
              new Error(
                doNotTranslate(`Turnstile challenge failed: ${errorCode}`),
              ),
            );
          },
        });
      });
    default:
      return assertUnreachable(provider);
  }
};
