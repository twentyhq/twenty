import { z } from 'zod';

import { METADATA_LABEL_VALID_PATTERN } from '~/pages/settings/data-model/constants/MetadataLabelValidPattern';
import { computeMetadataNameFromLabelOrThrow } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';
export const metadataLabelSchema = (existingLabels?: string[]) => {
  return z
    .string()
    .trim()
    .min(1, "Label cannot be empty")
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
    )
    .refine((label) => {
      try {
        if(!existingLabels || !label || label.length == 0) {
        return true
      }
      return !existingLabels.includes(computeMetadataNameFromLabelOrThrow(label));
    }
      catch(error) {
        return false
      }
    }, {
      message: "Label must be unique",
    });
};