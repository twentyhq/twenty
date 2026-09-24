import { registerEnumType } from '@nestjs/graphql';

export enum EventLogFilterOperand {
  IS = 'IS',
  IS_NOT = 'IS_NOT',
}

registerEnumType(EventLogFilterOperand, {
  name: 'EventLogFilterOperand',
});
