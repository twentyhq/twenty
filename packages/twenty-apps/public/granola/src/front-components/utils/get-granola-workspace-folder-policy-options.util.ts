import { t } from 'twenty-sdk/front-component';

import { type GranolaFolderPolicyOption } from 'src/front-components/types/granola-folder-policy-option.type';
import { type GranolaWorkspaceFolderPolicy } from 'src/front-components/types/granola-workspace-folder-policy.type';

export const getGranolaWorkspaceFolderPolicyOptions =
  (): GranolaFolderPolicyOption<GranolaWorkspaceFolderPolicy>[] => [
    {
      policy: 'ALL_FOLDERS',
      title: t('Everything'),
      description: t('Sync notes from every folder you can access'),
    },
    {
      policy: 'SELECTED_FOLDERS',
      title: t('Some folders'),
      description: t(
        'Sync only the folders you pick, including their subfolders',
      ),
    },
  ];
