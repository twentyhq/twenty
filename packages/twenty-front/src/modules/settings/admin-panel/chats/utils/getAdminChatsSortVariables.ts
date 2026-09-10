import { isDefined } from 'twenty-shared/utils';

import { type TableSortValue } from '@/ui/layout/table/types/TableSortValue';
import {
  AdminChatThreadSortDirection,
  AdminChatThreadSortField,
} from '~/generated-admin/graphql';

type AdminChatsSortVariables = {
  sortBy: AdminChatThreadSortField;
  sortDirection: AdminChatThreadSortDirection;
};

const isAdminChatThreadSortField = (
  fieldName: string,
): fieldName is AdminChatThreadSortField =>
  Object.values(AdminChatThreadSortField).includes(
    fieldName as AdminChatThreadSortField,
  );

export const getAdminChatsSortVariables = (
  sortValue: TableSortValue | null,
): AdminChatsSortVariables => {
  if (
    !isDefined(sortValue) ||
    !isAdminChatThreadSortField(sortValue.fieldName)
  ) {
    return {
      sortBy: AdminChatThreadSortField.CREATED_AT,
      sortDirection: AdminChatThreadSortDirection.DESC,
    };
  }

  return {
    sortBy: sortValue.fieldName,
    sortDirection:
      sortValue.direction === 'asc'
        ? AdminChatThreadSortDirection.ASC
        : AdminChatThreadSortDirection.DESC,
  };
};
