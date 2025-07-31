import { CustomException } from 'src/utils/custom-exception';

export class ViewGroupException extends CustomException {
  declare code: ViewGroupExceptionCode;
  constructor(
    message: string,
    code: ViewGroupExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, userFriendlyMessage);
  }
}

export enum ViewGroupExceptionCode {
  VIEW_GROUP_NOT_FOUND = 'VIEW_GROUP_NOT_FOUND',
  INVALID_VIEW_GROUP_DATA = 'INVALID_VIEW_GROUP_DATA',
}

export enum ViewGroupExceptionMessage {
  WORKSPACE_ID_REQUIRED = 'WorkspaceId is required',
  VIEW_ID_REQUIRED = 'ViewId is required',
  VIEW_GROUP_NOT_FOUND = 'View group not found',
  INVALID_VIEW_GROUP_DATA = 'Invalid view group data',
  FIELD_METADATA_ID_REQUIRED = 'FieldMetadataId is required',
}

export enum ViewGroupExceptionUserFriendlyMessage {
  WORKSPACE_ID_REQUIRED = 'WorkspaceId is required to create a view group.',
  VIEW_ID_REQUIRED = 'ViewId is required to create a view group.',
  FIELD_METADATA_ID_REQUIRED = 'FieldMetadataId is required to create a view group.',
}
