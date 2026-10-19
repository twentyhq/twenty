import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('GettingStartedProgress')
export class GettingStartedProgressDTO {
  @Field(() => Number)
  creditsEarned: number;

  @Field(() => [String])
  completedSteps: string[];

  @Field(() => String, { nullable: true })
  selectedStep: string | null;

  @Field(() => String, { nullable: true })
  snoozedUntil: string | null;
}
