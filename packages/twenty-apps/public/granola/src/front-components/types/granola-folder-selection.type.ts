import { type GranolaWorkspaceFolderPolicy } from 'src/front-components/types/granola-workspace-folder-policy.type';

export type GranolaFolderSelection = {
  selectedFolderIds: string[];
  policy: GranolaWorkspaceFolderPolicy;
  hasInaccessibleSelection: boolean;
  isSelectionPending: boolean;
};
