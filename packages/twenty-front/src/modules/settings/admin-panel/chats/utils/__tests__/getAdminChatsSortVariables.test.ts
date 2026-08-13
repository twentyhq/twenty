import { getAdminChatsSortVariables } from '@/settings/admin-panel/chats/utils/getAdminChatsSortVariables';
import {
  AdminChatThreadSortDirection,
  AdminChatThreadSortField,
} from '~/generated-admin/graphql';

describe('getAdminChatsSortVariables', () => {
  it('should default to created at descending when no sort is set', () => {
    expect(getAdminChatsSortVariables(null)).toEqual({
      sortBy: AdminChatThreadSortField.CREATED_AT,
      sortDirection: AdminChatThreadSortDirection.DESC,
    });
  });

  it('should default when the sorted field is not a server sort field', () => {
    expect(
      getAdminChatsSortVariables({
        fieldName: 'unknownField',
        orderBy: 'AscNullsLast',
      }),
    ).toEqual({
      sortBy: AdminChatThreadSortField.CREATED_AT,
      sortDirection: AdminChatThreadSortDirection.DESC,
    });
  });

  it('should map an ascending message count sort', () => {
    expect(
      getAdminChatsSortVariables({
        fieldName: AdminChatThreadSortField.MESSAGE_COUNT,
        orderBy: 'AscNullsLast',
      }),
    ).toEqual({
      sortBy: AdminChatThreadSortField.MESSAGE_COUNT,
      sortDirection: AdminChatThreadSortDirection.ASC,
    });
  });

  it('should map a descending updated at sort', () => {
    expect(
      getAdminChatsSortVariables({
        fieldName: AdminChatThreadSortField.UPDATED_AT,
        orderBy: 'DescNullsLast',
      }),
    ).toEqual({
      sortBy: AdminChatThreadSortField.UPDATED_AT,
      sortDirection: AdminChatThreadSortDirection.DESC,
    });
  });
});
