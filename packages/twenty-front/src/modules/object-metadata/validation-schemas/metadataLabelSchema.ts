import { errors } from '@/settings/data-model/fields/forms/utils/errorMessages';
import { z } from 'zod';
import { computeMetadataNameFromLabelOrThrow } from '~/pages/settings/data-model/utils/computeMetadataNameFromLabelOrThrow';

import { METADATA_LABEL_VALID_PATTERN } from '~/pages/settings/data-model/constants/MetadataLabelValidPattern';
export const metadataLabelSchema = (existingLabels?: string[]) => {
  return z
    .string()
    .trim()
    .min(1, errors.LabelEmpty)
    .regex(METADATA_LABEL_VALID_PATTERN, errors.LabelNotFormattable)
    .refine(
      (label) => {
        try {
          computeMetadataNameFromLabelOrThrow(label);
          return true;
        } catch {
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
          return !existingLabels.includes(
            computeMetadataNameFromLabelOrThrow(label),
          );
        } catch {
          return false;
        }
      },
      {
        message: errors.LabelNotUnique,
      },
    );
};
