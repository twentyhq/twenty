import { CustomException } from 'src/utils/custom-exception';

export class ViewFieldException extends CustomException {
  declare code: ViewFieldExceptionCode;
  constructor(
    message: string,
    code: ViewFieldExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, userFriendlyMessage);
  }
}

export enum ViewFieldExceptionCode {
  VIEW_FIELD_NOT_FOUND = 'VIEW_FIELD_NOT_FOUND',
  INVALID_VIEW_FIELD_DATA = 'INVALID_VIEW_FIELD_DATA',
}

export enum ViewFieldExceptionMessage {
  WORKSPACE_ID_REQUIRED = 'WorkspaceId is required',
  VIEW_ID_REQUIRED = 'ViewId is required',
  VIEW_FIELD_NOT_FOUND = 'View field not found',
  INVALID_VIEW_FIELD_DATA = 'Invalid view field data',
  FIELD_METADATA_ID_REQUIRED = 'FieldMetadataId is required',
}

export enum ViewFieldExceptionUserFriendlyMessage {
  WORKSPACE_ID_REQUIRED = 'WorkspaceId is required to create a view field.',
  VIEW_ID_REQUIRED = 'ViewId is required to create a view field.',
  FIELD_METADATA_ID_REQUIRED = 'FieldMetadataId is required to create a view field.',
}
