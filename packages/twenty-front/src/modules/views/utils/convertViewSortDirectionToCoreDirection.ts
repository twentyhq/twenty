import { ViewSortDirection } from "~/generated/graphql";

export const convertViewSortDirectionToCoreDirection = (
  viewSortDirection: string,
): ViewSortDirection => {
  return viewSortDirection === 'asc' ? ViewSortDirection.ASC : ViewSortDirection.DESC;
};
