import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SafeHtml } from 'src/types/safe-html.type';
import { escapeHtml } from 'src/utils/escape-html.util';

type HtmlValue = string | SafeHtml | null | undefined;

// A request body can carry an object shaped like SafeHtml: only markup this tag built is trusted
const TRUSTED_HTML = new WeakSet<SafeHtml>();

const toSafeHtml = (value: HtmlValue): string => {
  if (!isDefined(value)) {
    return '';
  }

  return !isString(value) && TRUSTED_HTML.has(value)
    ? value.safeHtml
    : escapeHtml(String(value));
};

export const html = (
  parts: TemplateStringsArray,
  ...values: HtmlValue[]
): SafeHtml => {
  const trustedHtml = {
    safeHtml: parts.reduce(
      (result, part, index) => `${result}${part}${toSafeHtml(values[index])}`,
      '',
    ),
  };

  TRUSTED_HTML.add(trustedHtml);

  return trustedHtml;
};
