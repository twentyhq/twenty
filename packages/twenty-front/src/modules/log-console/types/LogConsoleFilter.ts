import { type EventLogFilterOperand } from '~/generated-metadata/graphql';

export type LogConsoleFilter = {
  filterFieldId: string;
  operand: EventLogFilterOperand;
  values: string[];
};
