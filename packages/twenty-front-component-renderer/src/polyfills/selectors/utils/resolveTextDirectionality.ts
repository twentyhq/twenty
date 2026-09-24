import { type Directionality } from '@/polyfills/selectors/types/Directionality';

const RIGHT_TO_LEFT_CHARACTER_PATTERN =
  /[\p{Script=Hebrew}\p{Script=Arabic}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}\p{Script=Samaritan}\p{Script=Mandaic}\p{Script=Adlam}]/u;

const LETTER_PATTERN = /\p{L}/u;

export const resolveTextDirectionality = (
  text: string,
): Directionality | null => {
  for (const character of text) {
    if (RIGHT_TO_LEFT_CHARACTER_PATTERN.test(character)) {
      return 'rtl';
    }

    if (LETTER_PATTERN.test(character)) {
      return 'ltr';
    }
  }

  return null;
};
