import { type RouteTrigger } from '~/generated/graphql';
import { type TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { msg } from '@lingui/core/macro';

export const SETTINGS_ROUTE_TRIGGER_TABLE_METADATA: TableMetadata<RouteTrigger> =
  {
    tableId: 'settingsRouteTrigger',
    fields: [
      {
        fieldLabel: msg`Path`,
        fieldName: 'path',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: msg`Method`,
        fieldName: 'httpMethod',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: msg`Auth Required`,
        fieldName: 'isAuthRequired',
        fieldType: 'string',
        align: 'left',
      },
    ],
    initialSort: {
      fieldName: 'httpMethod',
      orderBy: 'AscNullsLast',
    },
  };
