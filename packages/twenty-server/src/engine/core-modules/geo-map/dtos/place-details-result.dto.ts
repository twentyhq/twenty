import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PlaceDetailsResultDto {
  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  postcode?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  country?: string;
}
