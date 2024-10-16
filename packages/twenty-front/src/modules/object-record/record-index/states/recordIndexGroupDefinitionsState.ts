import { createState } from 'twenty-ui';

import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';

export const recordIndexGroupDefinitionsState = createState<
  RecordGroupDefinition[]
>({
  key: 'recordIndexGroupDefinitionsState',
  defaultValue: [],
});
