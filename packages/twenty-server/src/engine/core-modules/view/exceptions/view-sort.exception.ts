import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export class ViewSortException extends CustomException {
  declare code: ViewSortExceptionCode;
  constructor(
    message: string,
    code: ViewSortExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, { userFriendlyMessage });
  }
}

export enum ViewSortExceptionCode {
  VIEW_SORT_NOT_FOUND = 'VIEW_SORT_NOT_FOUND',
  INVALID_VIEW_SORT_DATA = 'INVALID_VIEW_SORT_DATA',
}

export enum ViewSortExceptionMessageKey {
  WORKSPACE_ID_REQUIRED = 'WORKSPACE_ID_REQUIRED',
  VIEW_ID_REQUIRED = 'VIEW_ID_REQUIRED',
  VIEW_SORT_NOT_FOUND = 'VIEW_SORT_NOT_FOUND',
  INVALID_VIEW_SORT_DATA = 'INVALID_VIEW_SORT_DATA',
  FIELD_METADATA_ID_REQUIRED = 'FIELD_METADATA_ID_REQUIRED',
}

export const generateViewSortExceptionMessage = (
  key: ViewSortExceptionMessageKey,
  id?: string,
) => {
  let message = '';

  switch (key) {
    case ViewSortExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      message = `WorkspaceId is required`;
      break;
    case ViewSortExceptionMessageKey.VIEW_ID_REQUIRED:
      message = `ViewId is required`;
      break;
    case ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND:
      message = `View sort${id ? ` (id: ${id})` : ''} not found`;
      break;
    case ViewSortExceptionMessageKey.INVALID_VIEW_SORT_DATA:
      message = `Invalid view sort data${id ? ` for view sort id: ${id}` : ''}`;
      break;
    case ViewSortExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      message = `FieldMetadataId is required`;
      break;
    default:
      assertUnreachable(key);
  }

  return t`${message}`;
};

export const generateViewSortUserFriendlyExceptionMessage = (
  key: ViewSortExceptionMessageKey,
) => {
  switch (key) {
    case ViewSortExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return t`WorkspaceId is required to create a view sort.`;
    case ViewSortExceptionMessageKey.VIEW_ID_REQUIRED:
      return t`ViewId is required to create a view sort.`;
    case ViewSortExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      return t`FieldMetadataId is required to create a view sort.`;
  }
};
