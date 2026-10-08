import { isString } from '@sniptt/guards';

const INPUT_TYPE_KEYWORDS = new Set([
  'button',
  'checkbox',
  'color',
  'date',
  'datetime-local',
  'email',
  'file',
  'hidden',
  'image',
  'month',
  'number',
  'password',
  'radio',
  'range',
  'reset',
  'search',
  'submit',
  'tel',
  'text',
  'time',
  'url',
  'week',
]);

export const resolveInputTypeState = (type: unknown): string => {
  const lowerCasedType = isString(type) ? type.toLowerCase() : '';

  return INPUT_TYPE_KEYWORDS.has(lowerCasedType) ? lowerCasedType : 'text';
};
