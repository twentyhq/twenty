import { Field, InputType } from '@nestjs/graphql';

import { EventLogFilterOperand } from './event-log-filter-operand.enum';

@InputType()
export class EventLogFieldFilterInput {
  @Field(() => String)
  field: string;

  @Field(() => EventLogFilterOperand)
  operand: EventLogFilterOperand;

  @Field(() => [String])
  values: string[];
}
