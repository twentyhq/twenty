import { t } from 'twenty-sdk/front-component';

import { type GranolaFolderPolicyOption } from 'src/front-components/types/granola-folder-policy-option.type';

export const getGranolaMemberFolderPolicyOptions =
  (): GranolaFolderPolicyOption[] => [
    {
      policy: 'NO_FOLDERS',
      title: t('Off'),
      description: t('Share none of your Granola notes'),
    },
    {
      policy: 'SELECTED_FOLDERS',
      title: t('Some folders'),
      description: t(
        'Share new notes from the folders you pick, including their subfolders',
      ),
    },
  ];
