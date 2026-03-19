import { getDataResidencyFlag } from '@/settings/admin-panel/ai/utils/getDataResidencyFlag';
import { getDataResidencyLabel } from '@/settings/admin-panel/ai/utils/getDataResidencyLabel';

export const getDataResidencyDisplay = (residency: string): string => {
  const flag = getDataResidencyFlag(residency);
  const label = getDataResidencyLabel(residency);

  return `${flag} ${label}`;
};
