import { CustomException } from 'src/utils/custom-exception';

export class ViewSortException extends CustomException {
  declare code: ViewSortExceptionCode;
  constructor(
    message: string,
    code: ViewSortExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, userFriendlyMessage);
  }
}

export enum ViewSortExceptionCode {
  VIEW_SORT_NOT_FOUND = 'VIEW_SORT_NOT_FOUND',
  INVALID_VIEW_SORT_DATA = 'INVALID_VIEW_SORT_DATA',
}

export enum ViewSortExceptionMessage {
  WORKSPACE_ID_REQUIRED = 'WorkspaceId is required',
  VIEW_ID_REQUIRED = 'ViewId is required',
  VIEW_SORT_NOT_FOUND = 'View sort not found',
  INVALID_VIEW_SORT_DATA = 'Invalid view sort data',
  FIELD_METADATA_ID_REQUIRED = 'FieldMetadataId is required',
}

export enum ViewSortExceptionUserFriendlyMessage {
  WORKSPACE_ID_REQUIRED = 'WorkspaceId is required to create a view.',
  VIEW_ID_REQUIRED = 'ViewId is required to create a view sort.',
  FIELD_METADATA_ID_REQUIRED = 'FieldMetadataId is required to create a view sort.',
}
