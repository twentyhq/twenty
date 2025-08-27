import { type TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { msg } from '@lingui/core/macro';
import { type Agent } from '~/generated-metadata/graphql';

export const SETTINGS_AI_AGENT_TABLE_METADATA: TableMetadata<Agent> = {
  tableId: 'settingsAIAgent',
  fields: [
    {
      fieldLabel: msg`Name`,
      fieldName: 'name',
      fieldType: 'string',
      align: 'left',
    },
    {
      fieldLabel: msg`Type`,
      fieldName: 'isCustom',
      fieldType: 'string',
      align: 'left',
    },
  ],
  initialSort: {
    fieldName: 'name',
    orderBy: 'AscNullsLast',
  },
};
