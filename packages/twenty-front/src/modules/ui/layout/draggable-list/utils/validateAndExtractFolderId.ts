import { CustomError } from 'twenty-shared/utils';
import { FOLDER_DROPPABLE_IDS } from './folderDroppableIds';

type ValidateAndExtractFolderIdParams = {
  droppableId: string;
  // TODO: Remove orphanDroppableId prop when deleting all favorites code
  orphanDroppableId: string;
};

export const validateAndExtractFolderId = ({
  droppableId,
  orphanDroppableId,
}: ValidateAndExtractFolderIdParams): string | null => {
  if (droppableId === orphanDroppableId) {
    return null;
  }

  if (droppableId.startsWith(FOLDER_DROPPABLE_IDS.FOLDER_HEADER_PREFIX)) {
    const folderId = droppableId.replace(
      FOLDER_DROPPABLE_IDS.FOLDER_HEADER_PREFIX,
      '',
    );
    if (!folderId)
      throw new CustomError(
        `Invalid folder header ID: ${droppableId}`,
        'INVALID_FOLDER_HEADER_ID',
      );
    return folderId;
  }

  if (droppableId.startsWith(FOLDER_DROPPABLE_IDS.FOLDER_PREFIX)) {
    const folderId = droppableId.replace(
      FOLDER_DROPPABLE_IDS.FOLDER_PREFIX,
      '',
    );
    if (!folderId)
      throw new CustomError(
        `Invalid folder ID: ${droppableId}`,
        'INVALID_FOLDER_ID',
      );
    return folderId;
  }

  throw new CustomError(
    `Invalid droppable ID format: ${droppableId}`,
    'INVALID_DROPPABLE_ID_FORMAT',
  );
};
