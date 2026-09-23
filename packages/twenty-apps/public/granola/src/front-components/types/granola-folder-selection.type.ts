import { type GranolaFolderPolicy } from 'src/front-components/types/granola-folder-policy.type';

export type GranolaFolderSelection = {
  selectedFolderIds: string[];
  policy: GranolaFolderPolicy;
  hasInaccessibleSelection: boolean;
  isSelectionPending: boolean;
};
