import { isString } from '@sniptt/guards';

const TEXT_LIKE_INPUT_TYPES = new Set([
  'text',
  'search',
  'url',
  'tel',
  'password',
  'email',
  'number',
  '',
]);

export const isTextLikeInputType = (type: unknown): boolean => {
  const inputType = isString(type) ? type.toLowerCase() : '';
  return TEXT_LIKE_INPUT_TYPES.has(inputType);
};
