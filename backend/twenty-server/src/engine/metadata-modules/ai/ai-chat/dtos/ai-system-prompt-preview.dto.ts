import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('AISystemPromptSection')
export class AISystemPromptSectionDTO {
  @Field(() => String)
  title: string;

  @Field(() => String)
  content: string;

  @Field(() => Int)
  estimatedTokenCount: number;
}

@ObjectType('AISystemPromptPreview')
export class AISystemPromptPreviewDTO {
  @Field(() => [AISystemPromptSectionDTO])
  sections: AISystemPromptSectionDTO[];

  @Field(() => Int)
  estimatedTokenCount: number;
}
