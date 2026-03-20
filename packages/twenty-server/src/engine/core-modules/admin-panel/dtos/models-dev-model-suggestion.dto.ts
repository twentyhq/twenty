import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ModelsDevModelSuggestion')
export class ModelsDevModelSuggestionDTO {
  @Field(() => String)
  modelId: string;

  @Field(() => String)
  name: string;

  @Field(() => Number)
  inputCostPerMillionTokens: number;

  @Field(() => Number)
  outputCostPerMillionTokens: number;

  @Field(() => Number, { nullable: true })
  cachedInputCostPerMillionTokens?: number;

  @Field(() => Number, { nullable: true })
  cacheCreationCostPerMillionTokens?: number;

  @Field(() => Number)
  contextWindowTokens: number;

  @Field(() => Number)
  maxOutputTokens: number;

  @Field(() => [String])
  modalities: string[];

  @Field(() => Boolean)
  supportsReasoning: boolean;
}
