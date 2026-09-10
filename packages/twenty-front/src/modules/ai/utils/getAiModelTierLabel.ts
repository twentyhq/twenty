import { t } from '@lingui/core/macro';
import { type AiModelTier } from 'twenty-shared/ai';

export const getAiModelTierLabel = (tier: AiModelTier): string => {
  switch (tier) {
    case 'extraFast':
      return t`Extra Fast`;
    case 'fast':
      return t`Fast`;
    case 'balanced':
      return t`Balanced`;
    case 'smart':
      return t`Smart`;
    case 'extraSmart':
      return t`Extra Smart`;
  }
};
