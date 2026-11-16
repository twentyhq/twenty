import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('AgentDailyRunCount')
export class AgentDailyRunCountDTO {
  @Field(() => String, {
    description: 'Day in the requested time zone, as YYYY-MM-DD',
  })
  day: string;

  @Field(() => Int)
  completedRunCount: number;

  @Field(() => Int)
  failedRunCount: number;

  @Field(() => Int, {
    description:
      'Runs neither completed nor failed, such as running or cancelled',
  })
  otherRunCount: number;

  @Field(() => Float)
  credits: number;
}
