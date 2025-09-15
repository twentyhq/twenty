import {
  IconCalendar,
  type IconComponent,
  IconLayoutKanban,
  IconTable,
} from 'twenty-ui/display';
export enum ViewType {
  Table = 'table',
  Kanban = 'kanban',
  Calendar = 'calendar',
}

const VIEW_TYPE_ICON_MAPPING = [
  { icon: IconLayoutKanban, value: ViewType.Kanban },
  { icon: IconTable, value: ViewType.Table },
  { icon: IconCalendar, value: ViewType.Calendar },
] as const satisfies {
  icon: IconComponent;
  value: ViewType;
}[];

export const viewTypeIconMapping = (viewType?: ViewType) => {
  return (
    VIEW_TYPE_ICON_MAPPING.find((type) => type.value === viewType)?.icon ??
    IconTable
  );
};
