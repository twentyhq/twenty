import { type TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { msg } from '@lingui/core/macro';

import { type SettingsSkillTableItem } from '~/pages/settings/ai/types/SettingsSkillTableItem';

export const SETTINGS_SKILL_TABLE_METADATA: TableMetadata<SettingsSkillTableItem> =
  {
    tableId: 'settingsSkill',
    fields: [
      {
        fieldLabel: msg`Name`,
        fieldName: 'label',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: msg`App`,
        fieldName: 'applicationLabel',
        fieldType: 'string',
        align: 'left',
      },
    ],
    initialSort: {
      fieldName: 'label',
      direction: 'asc',
    },
  };
