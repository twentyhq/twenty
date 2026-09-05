import { normalizeHexColor } from 'src/front-components/utils/normalize-hex-color.util';

export const getNormalizedHexValue = (value: string): string | undefined => {
  if (value.trim() === '') {
    return '';
  }

  return normalizeHexColor(value);
};
