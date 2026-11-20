import { t } from 'twenty-sdk/front-component';

import { type GranolaFolderPolicyOption } from 'src/front-components/types/granola-folder-policy-option.type';

export const getGranolaMemberFolderPolicyOptions =
  (): GranolaFolderPolicyOption[] => [
    {
      policy: 'NO_FOLDERS',
      title: t('Off'),
      description: t('Keep your private Granola notes out of Twenty'),
    },
    {
      policy: 'SELECTED_FOLDERS',
      title: t('Some folders'),
      description: t(
        'Share notes created after you pick a folder, including its subfolders',
      ),
    },
  ];
