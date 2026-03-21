import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ModelsDevProviderSuggestion')
export class ModelsDevProviderSuggestionDTO {
  @Field(() => String)
  id: string;

  @Field(() => Number)
  modelCount: number;

  @Field(() => String)
  npm: string;
}
