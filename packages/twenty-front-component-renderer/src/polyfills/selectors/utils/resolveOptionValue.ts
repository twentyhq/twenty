import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';
import { isString } from '@sniptt/guards';

const OPTION_TEXT_WHITESPACE_PATTERN = /\s+/g;

export const resolveOptionValue = (option: SelectorElementLike): string =>
  readElementAttributeIgnoringCase(option, 'value') ??
  (isString(option.textContent)
    ? option.textContent.replace(OPTION_TEXT_WHITESPACE_PATTERN, ' ').trim()
    : '');
