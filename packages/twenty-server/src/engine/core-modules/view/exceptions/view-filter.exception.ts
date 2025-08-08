import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export class ViewFilterException extends CustomException {
  declare code: ViewFilterExceptionCode;
  constructor(
    message: string,
    code: ViewFilterExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, { userFriendlyMessage });
  }
}

export enum ViewFilterExceptionCode {
  VIEW_FILTER_NOT_FOUND = 'VIEW_FILTER_NOT_FOUND',
  INVALID_VIEW_FILTER_DATA = 'INVALID_VIEW_FILTER_DATA',
}

export enum ViewFilterExceptionMessageKey {
  WORKSPACE_ID_REQUIRED = 'WORKSPACE_ID_REQUIRED',
  VIEW_ID_REQUIRED = 'VIEW_ID_REQUIRED',
  VIEW_FILTER_NOT_FOUND = 'VIEW_FILTER_NOT_FOUND',
  INVALID_VIEW_FILTER_DATA = 'INVALID_VIEW_FILTER_DATA',
  FIELD_METADATA_ID_REQUIRED = 'FIELD_METADATA_ID_REQUIRED',
}

export const generateViewFilterExceptionMessage = (
  key: ViewFilterExceptionMessageKey,
  id?: string,
) => {
  switch (key) {
    case ViewFilterExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return 'WorkspaceId is required';
    case ViewFilterExceptionMessageKey.VIEW_ID_REQUIRED:
      return 'ViewId is required';
    case ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND:
      return `View filter${id ? ` (id: ${id})` : ''} not found`;
    case ViewFilterExceptionMessageKey.INVALID_VIEW_FILTER_DATA:
      return `Invalid view filter data${id ? ` for view filter id: ${id}` : ''}`;
    case ViewFilterExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      return 'FieldMetadataId is required';
    default:
      assertUnreachable(key);
  }
};

export const generateViewFilterUserFriendlyExceptionMessage = (
  key: ViewFilterExceptionMessageKey,
) => {
  switch (key) {
    case ViewFilterExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return t`WorkspaceId is required to create a view filter.`;
    case ViewFilterExceptionMessageKey.VIEW_ID_REQUIRED:
      return t`ViewId is required to create a view filter.`;
    case ViewFilterExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      return t`FieldMetadataId is required to create a view filter.`;
  }
};
