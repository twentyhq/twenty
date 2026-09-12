import { isDefined } from 'twenty-shared/utils';

import { ALLOWED_HTML_ELEMENTS } from '@/constants/AllowedHtmlElements';

export const resolveRemoteElementPrototypes = (): object[] =>
  ALLOWED_HTML_ELEMENTS.map(
    ({ tag }): object | undefined => customElements.get(tag)?.prototype,
  ).filter(isDefined);
