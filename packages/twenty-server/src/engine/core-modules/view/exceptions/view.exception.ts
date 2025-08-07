import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export class ViewException extends CustomException {
  declare code: ViewExceptionCode;
  constructor(
    message: string,
    code: ViewExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, { userFriendlyMessage });
  }
}

export enum ViewExceptionCode {
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
  INVALID_VIEW_DATA = 'INVALID_VIEW_DATA',
}

export enum ViewExceptionMessageKey {
  WORKSPACE_ID_REQUIRED = 'WORKSPACE_ID_REQUIRED',
  OBJECT_METADATA_ID_REQUIRED = 'OBJECT_METADATA_ID_REQUIRED',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
  INVALID_VIEW_DATA = 'INVALID_VIEW_DATA',
}

export const generateViewExceptionMessage = (
  key: ViewExceptionMessageKey,
  id?: string,
) => {
  switch (key) {
    case ViewExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return 'WorkspaceId is required';
    case ViewExceptionMessageKey.OBJECT_METADATA_ID_REQUIRED:
      return 'ObjectMetadataId is required';
    case ViewExceptionMessageKey.VIEW_NOT_FOUND:
      return `View${id ? ` (id: ${id})` : ''} not found`;
    case ViewExceptionMessageKey.INVALID_VIEW_DATA:
      return `Invalid view data${id ? ` for view id: ${id}` : ''}`;
    default:
      assertUnreachable(key);
  }
};

export const generateViewUserFriendlyExceptionMessage = (
  key: ViewExceptionMessageKey,
) => {
  switch (key) {
    case ViewExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return t`WorkspaceId is required to create a view.`;
    case ViewExceptionMessageKey.OBJECT_METADATA_ID_REQUIRED:
      return t`ObjectMetadataId is required to create a view.`;
  }
};
