import { t } from '@lingui/core/macro';

import { type DateGroupKey } from '@/ai/utils/dateGroupKey';

export const getDateGroupTitle = (key: DateGroupKey): string => {
  switch (key) {
    case 'today':
      return t`Today`;
    case 'yesterday':
      return t`Yesterday`;
    case 'older':
      return t`Older`;
  }
};
