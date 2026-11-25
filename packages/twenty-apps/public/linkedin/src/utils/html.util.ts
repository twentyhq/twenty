import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SafeHtml } from 'src/types/safe-html.type';
import { escapeHtml } from 'src/utils/escape-html.util';

type HtmlValue = string | SafeHtml | null | undefined;

const toSafeHtml = (value: HtmlValue): string => {
  if (!isDefined(value)) {
    return '';
  }

  return isString(value) ? escapeHtml(value) : value.safeHtml;
};

export const html = (
  parts: TemplateStringsArray,
  ...values: HtmlValue[]
): SafeHtml => ({
  safeHtml: parts.reduce(
    (result, part, index) => `${result}${part}${toSafeHtml(values[index])}`,
    '',
  ),
});
