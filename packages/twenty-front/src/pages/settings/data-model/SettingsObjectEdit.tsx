import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFormSection } from '@/settings/data-model/components/SettingsObjectFormSection';
import { AppPath } from '@/types/AppPath';
import { IconArchive, IconSettings } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import useI18n from '@/ui/i18n/useI18n';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsObjectEdit = () => {
  const { translate } = useI18n('translations');
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();

  const { objectSlug = '' } = useParams();
  const {
    disableObjectMetadataItem,
    editObjectMetadataItem,
    findActiveObjectMetadataItemBySlug,
  } = useObjectMetadataItemForSettings();

  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);

  const [formValues, setFormValues] = useState<
    Partial<{
      icon: string;
      labelSingular: string;
      labelPlural: string;
      namePlural: string;
      nameSingular: string;
      description: string;
    }>
  >({});

  useEffect(() => {
    if (!activeObjectMetadataItem) {
      navigate(AppPath.NotFound);
      return;
    }

    if (!Object.keys(formValues).length) {
      setFormValues({
        icon: activeObjectMetadataItem.icon ?? undefined,
        labelSingular: activeObjectMetadataItem.labelSingular,
        nameSingular: activeObjectMetadataItem.nameSingular,
        labelPlural: activeObjectMetadataItem.labelPlural,
        namePlural: activeObjectMetadataItem.namePlural,
        description: activeObjectMetadataItem.description ?? undefined,
      });
    }
  }, [activeObjectMetadataItem, formValues, navigate]);

  if (!activeObjectMetadataItem) return null;

  const areRequiredFieldsFilled =
    !!formValues.labelSingular &&
    !!formValues.nameSingular &&
    !!formValues.labelPlural &&
    !!formValues.namePlural;

  const hasChanges =
    formValues.description !== activeObjectMetadataItem.description ||
    formValues.icon !== activeObjectMetadataItem.icon ||
    formValues.labelPlural !== activeObjectMetadataItem.labelPlural ||
    formValues.namePlural !== activeObjectMetadataItem.namePlural ||
    formValues.labelSingular !== activeObjectMetadataItem.labelSingular ||
    formValues.nameSingular !== activeObjectMetadataItem.nameSingular;

  const canSave = areRequiredFieldsFilled && hasChanges;

  const handleSave = async () => {
    const editedObjectMetadataItem = {
      ...activeObjectMetadataItem,
      ...formValues,
    };

    try {
      await editObjectMetadataItem(editedObjectMetadataItem);

      navigate(`/settings/objects/${getObjectSlug(editedObjectMetadataItem)}`);
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: 'error',
      });
    }
  };

  const handleDisable = async () => {
    await disableObjectMetadataItem(activeObjectMetadataItem);
    navigate('/settings/objects');
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title={translate('settings')}>
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: translate('objects'), href: '/settings/objects' },
              {
                children: activeObjectMetadataItem.labelPlural,
                href: `/settings/objects/${objectSlug}`,
              },
              { children: translate('edit') },
            ]}
          />
          {activeObjectMetadataItem.isCustom && (
            <SaveAndCancelButtons
              isSaveDisabled={!canSave}
              onCancel={() => navigate(`/settings/objects/${objectSlug}`)}
              onSave={handleSave}
            />
          )}
        </SettingsHeaderContainer>
        <SettingsObjectFormSection
          disabled={!activeObjectMetadataItem.isCustom}
          icon={formValues.icon}
          singularLabel={formValues.labelSingular}
          singularName={formValues.nameSingular}
          pluralLabel={formValues.labelPlural}
          pluralName={formValues.namePlural}
          description={formValues.description}
          onChange={(values) =>
            setFormValues((previousFormValues) => ({
              ...previousFormValues,
              ...values,
            }))
          }
        />
        <Section>
          <H2Title
            title={translate('dangerZone')}
            description={translate('disableObject')}
          />
          <Button
            Icon={IconArchive}
            title={translate('disable')}
            size="small"
            onClick={handleDisable}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
