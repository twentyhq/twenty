import { ViewType } from '~/generated-metadata/graphql';

export const convertViewTypeToCore = (viewType: string): ViewType => {
  return viewType === 'kanban' ? ViewType.KANBAN : ViewType.TABLE;
};
