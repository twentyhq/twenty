import { CustomException } from 'src/utils/custom-exception';

export class ViewFilterException extends CustomException {
  declare code: ViewFilterExceptionCode;
  constructor(
    message: string,
    code: ViewFilterExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, userFriendlyMessage);
  }
}

export enum ViewFilterExceptionCode {
  VIEW_FILTER_NOT_FOUND = 'VIEW_FILTER_NOT_FOUND',
  INVALID_VIEW_FILTER_DATA = 'INVALID_VIEW_FILTER_DATA',
}

export enum ViewFilterExceptionMessage {
  WORKSPACE_ID_REQUIRED = 'WorkspaceId is required',
  VIEW_ID_REQUIRED = 'ViewId is required',
  VIEW_FILTER_NOT_FOUND = 'View filter not found',
  INVALID_VIEW_FILTER_DATA = 'Invalid view filter data',
  FIELD_METADATA_ID_REQUIRED = 'FieldMetadataId is required',
}

export enum ViewFilterExceptionUserFriendlyMessage {
  WORKSPACE_ID_REQUIRED = 'WorkspaceId is required to create a view filter.',
  VIEW_ID_REQUIRED = 'ViewId is required to create a view filter.',
  FIELD_METADATA_ID_REQUIRED = 'FieldMetadataId is required to create a view filter.',
}
