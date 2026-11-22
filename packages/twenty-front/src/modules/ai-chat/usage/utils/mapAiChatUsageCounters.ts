import { isDefined } from 'twenty-shared/utils';

import { type AiChatUsage } from '@/ai-chat/usage/types/AiChatUsage';
import { type GetAiChatUsageQuery } from '~/generated-metadata/graphql';

export const mapAiChatUsageCounters = ({
  limitValue,
  consumedValue,
}: Pick<
  NonNullable<GetAiChatUsageQuery['aiChatUsage']>,
  'limitValue' | 'consumedValue'
>): Pick<AiChatUsage, 'limitValue' | 'consumedValue'> => ({
  limitValue: Number(limitValue),
  consumedValue: isDefined(consumedValue) ? Number(consumedValue) : null,
});
