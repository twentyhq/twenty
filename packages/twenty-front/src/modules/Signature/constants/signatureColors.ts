import { MAIN_COLORS } from 'twenty-ui/theme';

export type SignatureColor = keyof typeof MAIN_COLORS;

const SIGNATURE_COLORS: SignatureColor[] = [
  'green',
  'turquoise',
  'blue',
  'purple',
  'pink',
  'red',
  'orange',
  'yellow',
  'gray',
];

export const getSignatureColor = (index: number) => {
  return SIGNATURE_COLORS[index];
};
