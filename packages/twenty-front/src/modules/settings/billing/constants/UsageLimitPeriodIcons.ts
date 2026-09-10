import {
  IconCalendarMonth,
  IconCalendarRepeat,
  IconCalendarWeek,
  type IconComponent,
  IconSun,
} from 'twenty-ui/icon';

import { type UsageLimitPeriodUnit } from '@/settings/billing/types/UsageLimitPeriodUnit';

export const USAGE_LIMIT_PERIOD_ICONS: Record<
  UsageLimitPeriodUnit,
  IconComponent
> = {
  day: IconSun,
  week: IconCalendarWeek,
  month: IconCalendarMonth,
  allowancePeriod: IconCalendarRepeat,
};
