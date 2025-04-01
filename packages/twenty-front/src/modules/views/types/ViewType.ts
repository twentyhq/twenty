import { t } from '@lingui/core/macro';
import { IconLayoutKanban, IconTable, SelectOption } from 'twenty-ui';

export enum ViewType {
  Table = 'table',
  Kanban = 'kanban',
}

type AllViewTypeIcons = Record<ViewType, SelectOption<ViewType>>;

export const VIEW_ICONS = {
  kanban: {
    value: ViewType.Kanban,
    label: t`Table`,
    Icon: IconLayoutKanban,
  },
  table: {
    value: ViewType.Table,
    label: t`Kanban`,
    Icon: IconTable,
  },
} as const satisfies AllViewTypeIcons;

export const viewTypeIconMapping = (viewType?: ViewType) => {
  if (viewType === undefined) {
    return IconTable;
  }

  return VIEW_ICONS[viewType].Icon;
};
