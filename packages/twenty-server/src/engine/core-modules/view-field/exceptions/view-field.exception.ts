import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export class ViewFieldException extends CustomException {
  declare code: ViewFieldExceptionCode;
  constructor(
    message: string,
    code: ViewFieldExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, { userFriendlyMessage });
  }
}

export enum ViewFieldExceptionCode {
  VIEW_FIELD_NOT_FOUND = 'VIEW_FIELD_NOT_FOUND',
  INVALID_VIEW_FIELD_DATA = 'INVALID_VIEW_FIELD_DATA',
}

export enum ViewFieldExceptionMessageKey {
  WORKSPACE_ID_REQUIRED = 'WORKSPACE_ID_REQUIRED',
  VIEW_ID_REQUIRED = 'VIEW_ID_REQUIRED',
  VIEW_FIELD_NOT_FOUND = 'VIEW_FIELD_NOT_FOUND',
  INVALID_VIEW_FIELD_DATA = 'INVALID_VIEW_FIELD_DATA',
  FIELD_METADATA_ID_REQUIRED = 'FIELD_METADATA_ID_REQUIRED',
  VIEW_FIELD_ALREADY_EXISTS = 'VIEW_FIELD_ALREADY_EXISTS',
}

export const generateViewFieldExceptionMessage = (
  key: ViewFieldExceptionMessageKey,
  id?: string,
) => {
  switch (key) {
    case ViewFieldExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return 'WorkspaceId is required';
    case ViewFieldExceptionMessageKey.VIEW_ID_REQUIRED:
      return 'ViewId is required';
    case ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND:
      return `View field${id ? ` (id: ${id})` : ''} not found`;
    case ViewFieldExceptionMessageKey.INVALID_VIEW_FIELD_DATA:
      return `Invalid view field data${id ? ` for view field id: ${id}` : ''}`;
    case ViewFieldExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      return 'FieldMetadataId is required';
    case ViewFieldExceptionMessageKey.VIEW_FIELD_ALREADY_EXISTS:
      return 'View field already exists';
    default:
      assertUnreachable(key);
  }
};

export const generateViewFieldUserFriendlyExceptionMessage = (
  key: ViewFieldExceptionMessageKey,
) => {
  switch (key) {
    case ViewFieldExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return t`WorkspaceId is required to create a view field.`;
    case ViewFieldExceptionMessageKey.VIEW_ID_REQUIRED:
      return t`ViewId is required to create a view field.`;
    case ViewFieldExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      return t`FieldMetadataId is required to create a view field.`;
    case ViewFieldExceptionMessageKey.VIEW_FIELD_ALREADY_EXISTS:
      return t`View field already exists.`;
  }
};
