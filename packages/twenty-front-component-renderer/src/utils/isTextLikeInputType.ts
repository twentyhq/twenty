import { resolveInputTypeState } from '@/utils/resolveInputTypeState';

const TEXT_LIKE_INPUT_TYPES = new Set([
  'text',
  'search',
  'url',
  'tel',
  'password',
  'email',
  'number',
]);

export const isTextLikeInputType = (type: unknown): boolean =>
  TEXT_LIKE_INPUT_TYPES.has(resolveInputTypeState(type));
