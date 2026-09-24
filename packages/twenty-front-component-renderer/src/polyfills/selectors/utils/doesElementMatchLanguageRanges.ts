import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { resolveInheritedAttributeValue } from '@/polyfills/selectors/utils/resolveInheritedAttributeValue';

const parseLanguageRanges = (languageRanges: string): string[] =>
  languageRanges
    .split(',')
    .map((languageRange) =>
      languageRange
        .trim()
        .replace(/^["']|["']$/g, '')
        .toLowerCase(),
    )
    .filter(isNonEmptyString);

const doesLanguageMatchRange = ({
  language,
  languageRange,
}: {
  language: string;
  languageRange: string;
}): boolean =>
  languageRange === '*'
    ? isNonEmptyString(language)
    : language === languageRange || language.startsWith(`${languageRange}-`);

export const doesElementMatchLanguageRanges = ({
  element,
  languageRanges,
}: {
  element: SelectorElementLike;
  languageRanges: string | null;
}): boolean => {
  const language = resolveInheritedAttributeValue({
    element,
    attributeName: 'lang',
  });

  if (!isDefined(language) || !isDefined(languageRanges)) {
    return false;
  }

  return parseLanguageRanges(languageRanges).some((languageRange) =>
    doesLanguageMatchRange({ language, languageRange }),
  );
};
