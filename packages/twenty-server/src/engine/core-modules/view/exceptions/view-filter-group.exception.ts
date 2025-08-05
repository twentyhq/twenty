import { CustomException } from 'src/utils/custom-exception';

export class ViewFilterGroupException extends CustomException {
  declare code: ViewFilterGroupExceptionCode;
  constructor(
    message: string,
    code: ViewFilterGroupExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, { userFriendlyMessage });
  }
}

export enum ViewFilterGroupExceptionCode {
  VIEW_FILTER_GROUP_NOT_FOUND = 'VIEW_FILTER_GROUP_NOT_FOUND',
  INVALID_VIEW_FILTER_GROUP_DATA = 'INVALID_VIEW_FILTER_GROUP_DATA',
}

export enum ViewFilterGroupExceptionMessage {
  WORKSPACE_ID_REQUIRED = 'WorkspaceId is required',
  VIEW_ID_REQUIRED = 'ViewId is required',
  VIEW_FILTER_GROUP_NOT_FOUND = 'View filter group not found',
  INVALID_VIEW_FILTER_GROUP_DATA = 'Invalid view filter group data',
  FIELD_METADATA_ID_REQUIRED = 'FieldMetadataId is required',
}

export enum ViewFilterGroupExceptionUserFriendlyMessage {
  WORKSPACE_ID_REQUIRED = 'WorkspaceId is required to create a view filter group.',
  VIEW_ID_REQUIRED = 'ViewId is required to create a view filter group.',
  FIELD_METADATA_ID_REQUIRED = 'FieldMetadataId is required to create a view filter group.',
}
