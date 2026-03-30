import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('MaintenanceMode')
export class MaintenanceModeDTO {
  @Field(() => String)
  startAt: string;

  @Field(() => String)
  endAt: string;

  @Field(() => String, { nullable: true })
  link?: string;
}
