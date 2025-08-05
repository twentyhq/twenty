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

export enum ViewExceptionMessage {
  WORKSPACE_ID_REQUIRED = 'WorkspaceId is required',
  OBJECT_METADATA_ID_REQUIRED = 'ObjectMetadataId is required',
  VIEW_NOT_FOUND = 'View not found',
  INVALID_VIEW_DATA = 'Invalid view data',
}

export enum ViewExceptionUserFriendlyMessage {
  WORKSPACE_ID_REQUIRED = 'WorkspaceId is required to create a view.',
  OBJECT_METADATA_ID_REQUIRED = 'ObjectMetadataId is required to create a view.',
}
