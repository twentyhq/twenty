import { type MemberCreditsDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/member-credits-default-definition.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const MEMBER_CREDITS_DEFAULT_DEFINITION: MemberCreditsDefaultDefinition =
  {
    limitValueConfigVariable: 'MEMBER_CREDITS_WEEKLY_LIMIT',
    periodUnit: 'week',
    operationTypesByResourceType: {
      [UsageResourceType.AI]: [
        UsageOperationType.AI_CHAT_TOKEN,
        UsageOperationType.WEB_SEARCH,
      ],
    },
  };
