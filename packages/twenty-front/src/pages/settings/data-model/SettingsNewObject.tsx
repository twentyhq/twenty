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
import useI18n from '@/ui/i18n/useI18n';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsNewObject = () => {
  const { translate } = useI18n('translations');
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();

  const { createObjectMetadataItem: createObject } =
    useObjectMetadataItemForSettings();

  const [customFormValues, setCustomFormValues] = useState<{
    description?: string;
    icon: string;
    labelPlural: string;
    labelSingular: string;
    namePlural: string;
    nameSingular: string;
  }>({
    icon: 'IconListNumbers',
    labelPlural: '',
    labelSingular: '',
    namePlural: '',
    nameSingular: '',
  });

  const canSave =
    !!customFormValues.labelPlural &&
    !!customFormValues.labelSingular &&
    !!customFormValues.namePlural &&
    !!customFormValues.nameSingular;

  const handleSave = async () => {
    try {
      const createdObject = await createObject({
        labelPlural: customFormValues.labelPlural,
        labelSingular: customFormValues.labelSingular,
        namePlural: customFormValues.namePlural,
        nameSingular: customFormValues.nameSingular,
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
    <SubMenuTopBarContainer Icon={IconSettings} title={translate('settings')}>
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: translate('objects'), href: '/settings/objects' },
              { children: translate('new') },
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
          singularLabel={customFormValues.labelSingular}
          pluralLabel={customFormValues.labelPlural}
          singularName={customFormValues.nameSingular}
          pluralName={customFormValues.namePlural}
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
