import {
  IconApi,
  IconApps,
  IconFiles,
  type IconComponent,
  IconMail,
  IconSettingsAutomation,
  IconSparkles,
  IconWebhook,
} from 'twenty-ui/icon';

import { UsageResourceType } from '~/generated-metadata/graphql';

export const USAGE_LIMIT_RESOURCE_TYPE_ICONS: Record<
  UsageResourceType,
  IconComponent
> = {
  [UsageResourceType.AI]: IconSparkles,
  [UsageResourceType.API]: IconApi,
  [UsageResourceType.APP]: IconApps,
  [UsageResourceType.EMAIL]: IconMail,
  [UsageResourceType.LOGIC_FUNCTION]: IconSettingsAutomation,
  [UsageResourceType.STORAGE]: IconFiles,
  [UsageResourceType.WEBHOOK]: IconWebhook,
  [UsageResourceType.WORKFLOW]: IconSettingsAutomation,
};
