import {
  IconApi,
  IconCode,
  type IconComponent,
  IconMail,
  IconMessageCircle,
  IconPhone,
  IconPlayerPlay,
  IconRepeat,
  IconRobot,
  IconSearch,
  IconSettingsAutomation,
  IconWebhook,
} from 'twenty-ui/icon';

import { UsageOperationType } from '~/generated-metadata/graphql';

export const USAGE_LIMIT_OPERATION_TYPE_ICONS: Record<
  UsageOperationType,
  IconComponent
> = {
  [UsageOperationType.ALL]: IconPlayerPlay,
  [UsageOperationType.AI_CHAT_TOKEN]: IconMessageCircle,
  [UsageOperationType.AI_WORKFLOW_TOKEN]: IconRobot,
  [UsageOperationType.WORKFLOW_EXECUTION]: IconSettingsAutomation,
  [UsageOperationType.CODE_EXECUTION]: IconCode,
  [UsageOperationType.WEB_SEARCH]: IconSearch,
  [UsageOperationType.CALL_RECORDING]: IconPhone,
  [UsageOperationType.EMAIL_SEND]: IconMail,
  [UsageOperationType.API_REQUEST]: IconApi,
  [UsageOperationType.WEBHOOK_CALL]: IconWebhook,
  [UsageOperationType.SUBSCRIPTION]: IconRepeat,
};
