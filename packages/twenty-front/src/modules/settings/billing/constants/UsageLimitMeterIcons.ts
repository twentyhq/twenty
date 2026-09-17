import { IconCoins, type IconComponent, IconNumber123 } from 'twenty-ui/icon';

import { type UsageLimitMeter } from '@/settings/billing/types/UsageLimitMeter';

export const USAGE_LIMIT_METER_ICONS: Record<UsageLimitMeter, IconComponent> = {
  creditsUsedMicro: IconCoins,
  quantity: IconNumber123,
};
