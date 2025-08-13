import { ViewSortDirection } from '~/generated/graphql';

export const convertViewSortDirectionToCore = (
  viewSortDirection: string,
): ViewSortDirection => {
  return viewSortDirection === 'asc'
    ? ViewSortDirection.ASC
    : ViewSortDirection.DESC;
};
