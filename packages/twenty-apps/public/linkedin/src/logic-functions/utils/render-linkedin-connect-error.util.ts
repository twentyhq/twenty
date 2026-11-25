import { isNonEmptyString } from '@sniptt/guards';

import { type SafeHtml } from 'src/types/safe-html.type';
import { html } from 'src/utils/html.util';

export const renderLinkedinConnectError = (
  errorMessage: string | undefined,
): SafeHtml | null =>
  isNonEmptyString(errorMessage)
    ? html`<p class="error" role="alert">${errorMessage}</p>`
    : null;
