import { ArgsType, Field } from '@nestjs/graphql';

import { IsTimeZone } from 'class-validator';

@ArgsType()
export class AgentRunInsightsArgs {
  @Field(() => String, {
    description: 'IANA time zone the days are counted in',
  })
  @IsTimeZone()
  timeZone: string;
}
