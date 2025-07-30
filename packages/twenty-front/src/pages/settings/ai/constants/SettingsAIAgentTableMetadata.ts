import { TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { msg } from '@lingui/core/macro';
import { SettingsAIAgentTableItem } from '~/pages/settings/ai/types/SettingsAIAgentTableItem';

export const GET_SETTINGS_AI_AGENT_TABLE_METADATA: TableMetadata<SettingsAIAgentTableItem> =
  {
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
        fieldName: 'type',
        fieldType: 'string',
        align: 'left',
      },

    ],
    initialSort: {
      fieldName: 'name',
      orderBy: 'AscNullsLast',
    },
  }; 