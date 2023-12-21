import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFormSection } from '@/settings/data-model/components/SettingsObjectFormSection';
import { IconSettings } from '@/ui/display/icon';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsNewObject = () => {
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();

  const { createObjectMetadataItem: createObject } =
    useObjectMetadataItemForSettings();

  const [customFormValues, setCustomFormValues] = useState<{
    description?: string;
    icon: string;
    labelPlural: string;
    labelSingular: string;
  }>({ icon: 'IconPigMoney', labelPlural: '', labelSingular: '' });

  const canSave =
    !!customFormValues.labelPlural && !!customFormValues.labelSingular;

  const handleSave = async () => {
    try {
      const createdObject = await createObject({
        labelPlural: customFormValues.labelPlural,
        labelSingular: customFormValues.labelSingular,
        description: customFormValues.description,
        icon: customFormValues.icon,
      });

      navigate(
        createdObject.data?.createOneObject.isActive
          ? `/settings/objects/${getObjectSlug(
              createdObject.data.createOneObject,
            )}`
          : '/settings/objects',
      );
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: 'error',
      });
    }
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'Objects', href: '/settings/objects' },
              { children: 'New' },
            ]}
          />
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            onCancel={() => {
              navigate('/settings/objects');
            }}
            onSave={handleSave}
          />
        </SettingsHeaderContainer>
        <SettingsObjectFormSection
          icon={customFormValues.icon}
          singularName={customFormValues.labelSingular}
          pluralName={customFormValues.labelPlural}
          description={customFormValues.description}
          onChange={(formValues) => {
            setCustomFormValues((previousValues) => ({
              ...previousValues,
              ...formValues,
            }));
          }}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
