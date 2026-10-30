import { type DataResidency } from 'twenty-shared/ai';
import { type MessageDescriptor } from '@lingui/core';

import { DATA_RESIDENCY_CONFIG } from '@/ai/constants/DataResidencyConfig';

export const getDataResidencyOptions = (
  translate: (message: MessageDescriptor) => string,
) =>
  (Object.keys(DATA_RESIDENCY_CONFIG) as DataResidency[]).map((key) => ({
    value: key,
    label: `${DATA_RESIDENCY_CONFIG[key].flag} ${translate(DATA_RESIDENCY_CONFIG[key].label)}`,
  }));
