import { isDefined } from 'twenty-sdk/utils';

import {
  type GranolaFolder,
  type GranolaNote,
} from 'src/logic-functions/types/granola-api.type';
import { type GranolaPersonalFolderSelection } from 'src/logic-functions/types/granola-personal-folder-selection.type';

export const isGranolaPersonalNoteSelected = ({
  note,
  selection,
  folders,
}: {
  note: Pick<GranolaNote, 'created_at' | 'folder_membership'>;
  selection: GranolaPersonalFolderSelection[];
  folders: Pick<GranolaFolder, 'id' | 'parent_folder_id'>[];
}): boolean => {
  const createdAt = Date.parse(note.created_at);
  const selectedFolderIds = new Set(
    selection
      .filter(({ selectedAt }) => createdAt >= Date.parse(selectedAt))
      .map(({ folderId }) => folderId),
  );
  if (selectedFolderIds.size === 0) {
    return false;
  }

  const parentsById = new Map(
    folders.map((folder) => [folder.id, folder.parent_folder_id]),
  );

  return note.folder_membership.some((folder) => {
    if (selectedFolderIds.has(folder.id)) {
      return true;
    }

    const visited = new Set([folder.id]);
    let parentId: string | null | undefined = folder.parent_folder_id;

    while (isDefined(parentId) && !visited.has(parentId)) {
      if (selectedFolderIds.has(parentId)) {
        return true;
      }

      visited.add(parentId);
      parentId = parentsById.get(parentId);
    }

    return false;
  });
};
