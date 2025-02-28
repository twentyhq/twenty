import { ViewType } from '@airtable/blocks/models';
import { t } from '@airtable/blocks/ui';
import { IconLayoutKanban, IconTable } from 'twenty-ui';

export const VIEW_PICKER_CONTENT_CREATE_MODE_TABLE_SELECT_OPTIONS = [
    { value: ViewType.Table, label: t`Table`, Icon: IconTable },
    {
      value: ViewType.Kanban,
      label: t`Kanban`,
      Icon: IconLayoutKanban,
    },
  ];