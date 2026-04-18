import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('AISystemPromptSection')
export class AiSystemPromptSectionDTO {
  @Field(() => String)
  title: string;

  @Field(() => String)
  content: string;

  @Field(() => Int)
  estimatedTokenCount: number;
}

@ObjectType('AISystemPromptPreview')
export class AiSystemPromptPreviewDTO {
  @Field(() => [AiSystemPromptSectionDTO])
  sections: AiSystemPromptSectionDTO[];

  @Field(() => Int)
  estimatedTokenCount: number;
}
