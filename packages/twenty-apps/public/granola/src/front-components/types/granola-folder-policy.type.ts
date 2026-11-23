import { type GranolaMemberFolderPolicy } from 'src/front-components/types/granola-member-folder-policy.type';
import { type GranolaWorkspaceFolderPolicy } from 'src/front-components/types/granola-workspace-folder-policy.type';

export type GranolaFolderPolicy =
  | GranolaWorkspaceFolderPolicy
  | GranolaMemberFolderPolicy;
