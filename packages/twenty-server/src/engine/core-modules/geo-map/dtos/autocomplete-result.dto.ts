import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AutocompleteResult')
export class AutocompleteResultDTO {
  @Field()
  text: string;

  @Field()
  placeId: string;
}
