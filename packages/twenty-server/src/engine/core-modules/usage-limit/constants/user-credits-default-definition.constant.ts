import { type UserCreditsDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/user-credits-default-definition.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const USER_CREDITS_DEFAULT_DEFINITION: UserCreditsDefaultDefinition = {
  limitValueConfigVariable: 'USER_CREDITS_WEEKLY_LIMIT',
  periodUnit: 'week',
  operationTypesByResourceType: {
    [UsageResourceType.AI]: [
      UsageOperationType.AI_CHAT_TOKEN,
      UsageOperationType.WEB_SEARCH,
    ],
  },
};
