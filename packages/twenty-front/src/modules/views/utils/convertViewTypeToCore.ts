import { ViewType } from '~/generated-metadata/graphql';

export const convertViewTypeToCore = (viewType: string): ViewType => {
  const viewTypeToCoreMapping = {
    kanban: ViewType.KANBAN,
    table: ViewType.TABLE,
    calendar: ViewType.CALENDAR,
  };

  return (
    viewTypeToCoreMapping[viewType as keyof typeof viewTypeToCoreMapping] ??
    ViewType.TABLE
  );
};
