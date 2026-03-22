import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ModelsDevModelSuggestion')
export class ModelsDevModelSuggestionDTO {
  @Field(() => String)
  // models.dev catalog key for the model (often a bare id). Not the composite `provider/modelName` workspace id used in the registry.
  modelId: string;

  @Field(() => String)
  // Display name from the catalog, or the catalog key when absent.
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
