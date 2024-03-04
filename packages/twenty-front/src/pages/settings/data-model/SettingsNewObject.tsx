import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCreateOneObjectMetadataItem } from '@/object-metadata/hooks/useCreateOneObjectMetadataItem';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFormSection } from '@/settings/data-model/components/SettingsObjectFormSection';
import { settingsCreateObjectInputSchema } from '@/settings/data-model/validation-schemas/settingsCreateObjectInputSchema';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { IconSettings } from '@/ui/display/icon';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsNewObject = () => {
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();

  const { createOneObjectMetadataItem } = useCreateOneObjectMetadataItem();

  const [formValues, setFormValues] = useState<{
    description?: string;
    icon: string;
    labelPlural: string;
    labelSingular: string;
  }>({ icon: 'IconListNumbers', labelPlural: '', labelSingular: '' });

  const canSave = !!formValues.labelPlural && !!formValues.labelSingular;

  const handleSave = async () => {
    try {
      const createdObject = await createOneObjectMetadataItem(
        settingsCreateObjectInputSchema.parse(formValues),
      );

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
              {
                children: 'Objects',
                href: getSettingsPagePath(SettingsPath.Objects),
              },
              { children: 'New' },
            ]}
          />
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            onCancel={() => navigate(getSettingsPagePath(SettingsPath.Objects))}
            onSave={handleSave}
          />
        </SettingsHeaderContainer>
        <SettingsObjectFormSection
          icon={formValues.icon}
          singularName={formValues.labelSingular}
          pluralName={formValues.labelPlural}
          description={formValues.description}
          onChange={(formValues) => {
            setFormValues((previousValues) => ({
              ...previousValues,
              ...formValues,
            }));
          }}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
