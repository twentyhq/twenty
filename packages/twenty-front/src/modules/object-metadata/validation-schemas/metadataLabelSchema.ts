import { errors } from '@/object-metadata/utils/metadataLabelErrorMessages';
import { z } from 'zod';

import { computeMetadataNameFromLabel } from '@/object-metadata/utils/computeMetadataNameFromLabel';
export const metadataLabelSchema = (existingLabels?: string[]) => {
  return z
    .string()
    .trim()
    .min(1, errors.LabelEmpty)
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
