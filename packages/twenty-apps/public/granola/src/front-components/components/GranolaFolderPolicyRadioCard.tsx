import { t } from 'twenty-sdk/front-component';

import { GranolaFolderPolicyIcon } from 'src/front-components/components/GranolaFolderPolicyIcon';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
import { type GranolaFolderPolicy } from 'src/front-components/types/granola-folder-policy.type';

type GranolaFolderPolicyRadioCardProps = {
  policy: GranolaFolderPolicy | undefined;
  selectedFoldersContent?: React.ReactNode;
  onChange?: (policy: GranolaFolderPolicy) => void;
};

export const GranolaFolderPolicyRadioCard = ({
  policy,
  selectedFoldersContent,
  onChange = () => undefined,
}: GranolaFolderPolicyRadioCardProps) => (
  <SettingsRadioCard
    value={policy}
    onChange={onChange}
    options={[
      {
        value: 'ALL_FOLDERS',
        cardMedia: <GranolaFolderPolicyIcon policy="ALL_FOLDERS" />,
        title: t('Everything'),
        description: t('Sync notes from every folder you can access'),
      },
      {
        value: 'SELECTED_FOLDERS',
        cardMedia: <GranolaFolderPolicyIcon policy="SELECTED_FOLDERS" />,
        title: t('Some folders'),
        description: t(
          'Sync only the folders you pick, including their subfolders',
        ),
        expandedContent: selectedFoldersContent,
      },
    ]}
  />
);
