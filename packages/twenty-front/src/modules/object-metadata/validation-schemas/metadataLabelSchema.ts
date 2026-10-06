import { errors } from '@/settings/data-model/fields/forms/utils/errorMessages';
import { z } from 'zod';

import { METADATA_LABEL_VALID_PATTERN } from '@/object-metadata/constants/MetadataLabelValidPattern';
import { computeMetadataNameFromLabel } from '@/object-metadata/utils/computeMetadataNameFromLabel';
export const metadataLabelSchema = (existingLabels?: string[]) => {
  return z
    .string()
    .trim()
    .min(1, errors.LabelEmpty)
    .regex(METADATA_LABEL_VALID_PATTERN, errors.LabelNotFormattable)
    .refine(
      (label) => {
        const computedName = computeMetadataNameFromLabel(label);

        return computedName !== '';
      },
      {
        message: errors.LabelNotFormattable,
      },
    )
    .refine(
      (label) => {
        if (!existingLabels || !label?.length) {
          return true;
        }
        const computedName = computeMetadataNameFromLabel(label);

        return computedName !== '' && !existingLabels.includes(computedName);
      },
      {
        message: errors.LabelNotUnique,
      },
    );
};
