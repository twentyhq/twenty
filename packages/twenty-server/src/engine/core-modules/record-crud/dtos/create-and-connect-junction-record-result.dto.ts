import { Field, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class CreateAndConnectJunctionRecordResultDto {
  @Field(() => GraphQLJSON)
  targetRecord: Record<string, unknown>;

  @Field(() => GraphQLJSON)
  junctionRecord: Record<string, unknown>;
}
