import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VersionDistributionEntry {
  @Field()
  version: string;

  @Field(() => Int)
  count: number;
}
