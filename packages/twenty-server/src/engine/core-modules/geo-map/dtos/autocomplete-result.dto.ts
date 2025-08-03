import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AutocompleteResultDto {
  @Field()
  text: string;

  @Field()
  placeId: string;
}
