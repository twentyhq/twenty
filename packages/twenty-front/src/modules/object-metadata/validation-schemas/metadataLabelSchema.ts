import { errors } from '@/settings/data-model/fields/forms/utils/errorMessages';
import { z } from 'zod';

import { METADATA_LABEL_VALID_PATTERN } from '~/pages/settings/data-model/constants/MetadataLabelValidPattern';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';
export const metadataLabelSchema = (existingLabels?: string[]) => {
  return z
    .string()
    .trim()
    .min(1, errors.LabelEmpty)
    .regex(METADATA_LABEL_VALID_PATTERN, errors.LabelNotFormattable)
    .refine(
      (label) => {
        try {
          computeMetadataNameFromLabel(label);
          return true;
        } catch (error) {
          return false;
        }
      },
      {
        message: errors.LabelNotFormattable,
      },
    )
    .refine(
      (label) => {
        try {
          if (!existingLabels || !label?.length) {
            return true;
          }
          return !existingLabels.includes(computeMetadataNameFromLabel(label));
        } catch (error) {
          return false;
        }
      },
      {
        message: errors.LabelNotUnique,
      },
    );
};
