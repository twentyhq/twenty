import { FOLDER_DROPPABLE_IDS } from './folderDroppableIds';

type ValidateAndExtractFolderIdParams = {
  droppableId: string;
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
    return (
      droppableId.slice(FOLDER_DROPPABLE_IDS.FOLDER_HEADER_PREFIX.length) ||
      null
    );
  }

  if (droppableId.startsWith(FOLDER_DROPPABLE_IDS.FOLDER_PREFIX)) {
    return droppableId.slice(FOLDER_DROPPABLE_IDS.FOLDER_PREFIX.length) || null;
  }

  return null;
};
