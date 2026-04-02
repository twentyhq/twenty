import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType('MaintenanceMode')
export class MaintenanceModeDTO {
  @Field(() => GraphQLISODateTime)
  startAt: Date;

  @Field(() => GraphQLISODateTime)
  endAt: Date;

  @Field(() => String, { nullable: true })
  link?: string;
}
