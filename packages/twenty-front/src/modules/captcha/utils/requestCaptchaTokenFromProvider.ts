import { doNotTranslate } from 'twenty-shared/i18n';
import { assertUnreachable } from 'twenty-shared/utils';
import { CaptchaDriverType } from '~/generated-metadata/graphql';

const CAPTCHA_WIDGET_SELECTOR = '#captcha-widget';

export const requestCaptchaTokenFromProvider = ({
  provider,
  siteKey,
}: {
  provider: CaptchaDriverType;
  siteKey: string;
}): Promise<string> => {
  switch (provider) {
    case CaptchaDriverType.GOOGLE_RECAPTCHA:
      return Promise.resolve(
        window.grecaptcha.execute(siteKey, { action: 'submit' }),
      );
    case CaptchaDriverType.TURNSTILE:
      return new Promise<string>((resolve, reject) => {
        // Turnstile rejects a second render in a container that already holds a widget
        const container = document.createElement('div');

        document.querySelector(CAPTCHA_WIDGET_SELECTOR)?.appendChild(container);

        const removeWidget = () => {
          window.turnstile.remove(widgetId);
          container.remove();
        };

        const widgetId = window.turnstile.render(container, {
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
