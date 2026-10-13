import { Field, ID, ObjectType } from '@nestjs/graphql';

import { AppConnectionDeduplicationOutcome } from 'src/engine/core-modules/application/connection-provider/connections/enums/app-connection-deduplication-outcome.enum';

@ObjectType('DeduplicateAppConnectionResult')
export class DeduplicateAppConnectionResult {
  @Field(() => ID)
  connectedAccountId: string;

  @Field(() => AppConnectionDeduplicationOutcome)
  outcome: AppConnectionDeduplicationOutcome;
}
