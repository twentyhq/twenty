import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ChannelSyncSuccess {
  @Field(() => Boolean)
  success: boolean;
}
