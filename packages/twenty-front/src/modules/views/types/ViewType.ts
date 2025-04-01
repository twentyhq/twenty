import { IconComponent, IconLayoutKanban, IconTable } from 'twenty-ui';

export enum ViewType {
  Table = 'table',
  Kanban = 'kanban',
}

export const viewTypeIconMapping = (viewType: ViewType): IconComponent => {
  return viewType === ViewType.Table ? IconTable : IconLayoutKanban;
};
