import { registerEnumType } from '@nestjs/graphql';

import { EventLogTable } from 'twenty-shared/types';

export const registerEventLogTableEnum = () => {
  registerEnumType(EventLogTable, {
    name: 'EventLogTable',
  });
};

export { EventLogTable };
