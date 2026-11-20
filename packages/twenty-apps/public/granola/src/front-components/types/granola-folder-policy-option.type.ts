import { type GranolaFolderPolicy } from 'src/front-components/types/granola-folder-policy.type';

export type GranolaFolderPolicyOption<TPolicy extends GranolaFolderPolicy> = {
  policy: TPolicy;
  title: string;
  description: string;
};
