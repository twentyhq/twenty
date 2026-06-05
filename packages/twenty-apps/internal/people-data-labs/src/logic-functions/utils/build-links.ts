import { toText } from 'src/logic-functions/utils/to-text';
import { type LinksValue } from 'src/types/links-value.type';
import { isDefined } from 'src/utils/is-defined';

export const buildLinks = (
  url: unknown,
  label?: unknown,
): LinksValue | undefined => {
  const primaryLinkUrl = toText(url);

  if (!isDefined(primaryLinkUrl)) {
    return undefined;
  }

  return {
    primaryLinkUrl,
    primaryLinkLabel: toText(label) ?? '',
    secondaryLinks: null,
  };
};
