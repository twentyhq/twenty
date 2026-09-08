import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AiModelBenchmarkDTO {
  @Field(() => String)
  modelId: string;

  @Field(() => String)
  modelName: string;

  @Field(() => String)
  modelSlug: string;

  @Field(() => Number, { nullable: true })
  outputTokensPerSecond?: number;

  @Field(() => Number, { nullable: true })
  intelligenceIndex?: number;

  @Field(() => Number, { nullable: true })
  costPerTask?: number;

  @Field(() => Number)
  intelligenceIndexVersion: number;

  @Field(() => String)
  fetchedAt: string;
}
