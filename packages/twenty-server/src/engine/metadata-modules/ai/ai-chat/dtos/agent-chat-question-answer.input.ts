import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class AgentChatQuestionAnswerInput {
  @Field(() => Int)
  questionIndex: number;

  // Indices into the question's options. Empty when only free text was given.
  @Field(() => [Int])
  selectedOptionIndices: number[];

  // The "Type anything to do differently." free-form fallback.
  @Field(() => String, { nullable: true })
  freeText?: string;
}
