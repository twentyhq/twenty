import { z } from 'zod';

import {
  METADATA_LABEL_VALID_STRING_PATTERN,
  METADATA_NAME_VALID_STRING_PATTERN,
} from '~/pages/settings/data-model/utils/constants.utils';
import { formatLabelOrThrows } from '~/pages/settings/data-model/utils/format-label.util';

export const metadataLabelSchema = z
  .string()
  .trim()
  .min(1)
  .regex(METADATA_LABEL_VALID_STRING_PATTERN)
  .refine(
    (label) => {
      try {
        formatLabelOrThrows(label, METADATA_NAME_VALID_STRING_PATTERN);
        return true;
      } catch (error) {
        return false;
      }
    },
    {
      message: 'Label is not formattable',
    },
  ); // allows non-latin char
