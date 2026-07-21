import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class AgentChatQuestionAnswerInput {
  @Field(() => Int)
  questionIndex: number;

  @Field(() => [Int])
  selectedOptionIndices: number[];

  @Field(() => String, { nullable: true })
  freeText?: string;
}
