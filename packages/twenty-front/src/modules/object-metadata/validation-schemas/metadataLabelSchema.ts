import { z } from 'zod';

import { METADATA_LABEL_VALID_PATTERN } from '~/pages/settings/data-model/constants/MetadataLabelValidPattern';
import { computeMetadataNameFromLabelOrThrow } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';

export const metadataLabelSchema = z
  .string()
  .trim()
  .min(1)
  .regex(METADATA_LABEL_VALID_PATTERN)
  .refine(
    (label) => {
      try {
        computeMetadataNameFromLabelOrThrow(label);
        return true;
      } catch (error) {
        return false;
      }
    },
    {
      message: 'Label is not formattable',
    },
  ); // allows non-latin char
