import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LocationDto {
  @Field(() => Float, { nullable: true })
  lat?: number;

  @Field(() => Float, { nullable: true })
  lng?: number;
}

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

  @Field(() => LocationDto, { nullable: true })
  location?: LocationDto;
}
