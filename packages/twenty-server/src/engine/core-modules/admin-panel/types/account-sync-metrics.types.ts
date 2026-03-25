import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AccountSyncJobByStatusCounter {
  @Field(() => Number, { nullable: true })
  NOT_SYNCED?: number;

  @Field(() => Number, { nullable: true })
  ACTIVE?: number;

  @Field(() => Number, { nullable: true })
  FAILED_INSUFFICIENT_PERMISSIONS?: number;

  @Field(() => Number, { nullable: true })
  FAILED_UNKNOWN?: number;
}
