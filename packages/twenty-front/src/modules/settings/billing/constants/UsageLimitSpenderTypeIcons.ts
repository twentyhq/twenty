import {
  IconApps,
  IconBrandTypescript,
  type IconComponent,
  IconKey,
  IconLego,
  IconSettings,
  IconSettingsAutomation,
  IconUsers,
} from 'twenty-ui/icon';

import { type UsageLimitSpenderType } from '@/settings/billing/types/UsageLimitSpenderType';

export const USAGE_LIMIT_SPENDER_TYPE_ICONS: Record<
  UsageLimitSpenderType,
  IconComponent
> = {
  workspace: IconSettings,
  userWorkspace: IconUsers,
  apiKey: IconKey,
  application: IconApps,
  agent: IconLego,
  workflow: IconSettingsAutomation,
  logicFunction: IconBrandTypescript,
};
