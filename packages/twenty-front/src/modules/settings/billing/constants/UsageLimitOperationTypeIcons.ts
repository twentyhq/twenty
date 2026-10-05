import {
  IconAddressBook,
  IconApi,
  IconCode,
  type IconComponent,
  IconFiles,
  IconLego,
  IconMail,
  IconMessage,
  IconPhone,
  IconPlayerPlay,
  IconRepeat,
  IconSearch,
  IconSend,
  IconSettingsAutomation,
  IconWebhook,
} from 'twenty-ui/icon';

import { UsageOperationType } from '~/generated-metadata/graphql';

export const USAGE_LIMIT_OPERATION_TYPE_ICONS: Record<
  UsageOperationType,
  IconComponent
> = {
  [UsageOperationType.ALL]: IconPlayerPlay,
  [UsageOperationType.AI_CHAT_TOKEN]: IconMessage,
  [UsageOperationType.AI_WORKFLOW_TOKEN]: IconLego,
  [UsageOperationType.WORKFLOW_EXECUTION]: IconSettingsAutomation,
  [UsageOperationType.CODE_EXECUTION]: IconCode,
  [UsageOperationType.WEB_SEARCH]: IconSearch,
  [UsageOperationType.CALL_RECORDING]: IconPhone,
  [UsageOperationType.EMAIL_SEND]: IconMail,
  [UsageOperationType.MESSAGE_CAMPAIGN_SEND]: IconSend,
  [UsageOperationType.API_REQUEST]: IconApi,
  [UsageOperationType.WEBHOOK_CALL]: IconWebhook,
  [UsageOperationType.STORAGE_FILE]: IconFiles,
  [UsageOperationType.RECORD_WRITE]: IconAddressBook,
  [UsageOperationType.SUBSCRIPTION]: IconRepeat,
};
