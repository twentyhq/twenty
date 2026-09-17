import { type GranolaSettingsFolder } from 'src/front-components/types/granola-settings-folder.type';

export type GranolaFoldersResult = {
  folders: GranolaSettingsFolder[];
  selectedFolderIds: string[];
  pendingFolderIds: string[] | undefined;
};
