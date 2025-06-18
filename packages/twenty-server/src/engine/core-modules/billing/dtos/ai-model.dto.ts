import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

import { ModelProvider } from 'src/engine/core-modules/billing/entities/ai-model.entity';

@ObjectType('AIModel')
export class AIModelDto {
  @Field(() => ID)
  modelId: string;

  @Field()
  displayName: string;

  @Field(() => ModelProvider)
  provider: ModelProvider;

  @Field(() => Float)
  inputCostPer1kTokensInCents: number;

  @Field(() => Float)
  outputCostPer1kTokensInCents: number;

  @Field()
  isActive: boolean;

  @Field()
  isDefault: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
