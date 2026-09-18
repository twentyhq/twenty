import { type GranolaSettingsFolder } from 'src/front-components/types/granola-settings-folder.type';
import { type GranolaStoredFolderSelection } from 'src/front-components/types/granola-stored-folder-selection.type';

export type GranolaFoldersResult = GranolaStoredFolderSelection & {
  folders: GranolaSettingsFolder[];
};
