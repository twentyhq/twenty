import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useMetadataObjectForSettings } from '@/metadata/hooks/useMetadataObjectForSettings';
import { getObjectSlug } from '@/metadata/utils/getObjectSlug';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFormSection } from '@/settings/data-model/components/SettingsObjectFormSection';
import { SettingsObjectIconSection } from '@/settings/data-model/object-edit/SettingsObjectIconSection';
import { AppPath } from '@/types/AppPath';
import { IconArchive, IconSettings } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsObjectEdit = () => {
  const navigate = useNavigate();

  const { objectSlug = '' } = useParams();
  const {
    disableMetadataObject,
    editMetadataObject,
    findActiveMetadataObjectBySlug,
    loading,
  } = useMetadataObjectForSettings();

  const activeMetadataObject = findActiveMetadataObjectBySlug(objectSlug);

  const [formValues, setFormValues] = useState<
    Partial<{
      icon: string;
      labelSingular: string;
      labelPlural: string;
      description: string;
    }>
  >({});

  useEffect(() => {
    if (loading) return;

    if (!activeMetadataObject) {
      navigate(AppPath.NotFound);
      return;
    }

    if (!Object.keys(formValues).length) {
      setFormValues({
        icon: activeMetadataObject.icon ?? undefined,
        labelSingular: activeMetadataObject.labelSingular,
        labelPlural: activeMetadataObject.labelPlural,
        description: activeMetadataObject.description ?? undefined,
      });
    }
  }, [activeMetadataObject, formValues, loading, navigate]);

  if (!activeMetadataObject) return null;

  const areRequiredFieldsFilled =
    !!formValues.labelSingular && !!formValues.labelPlural;

  const hasChanges =
    formValues.description !== activeMetadataObject.description ||
    formValues.icon !== activeMetadataObject.icon ||
    formValues.labelPlural !== activeMetadataObject.labelPlural ||
    formValues.labelSingular !== activeMetadataObject.labelSingular;

  const canSave = areRequiredFieldsFilled && hasChanges;

  const handleSave = async () => {
    const editedMetadataObject = { ...activeMetadataObject, ...formValues };

    await editMetadataObject(editedMetadataObject);

    navigate(`/settings/objects/${getObjectSlug(editedMetadataObject)}`);
  };

  const handleDisable = async () => {
    await disableMetadataObject(activeMetadataObject);
    navigate('/settings/objects');
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'Objects', href: '/settings/objects' },
              {
                children: activeMetadataObject.labelPlural,
                href: `/settings/objects/${objectSlug}`,
              },
              { children: 'Edit' },
            ]}
          />
          {!!activeMetadataObject.isCustom && (
            <SaveAndCancelButtons
              isSaveDisabled={!canSave}
              onCancel={() => navigate(`/settings/objects/${objectSlug}`)}
              onSave={handleSave}
            />
          )}
        </SettingsHeaderContainer>
        <SettingsObjectIconSection
          disabled={!activeMetadataObject.isCustom}
          iconKey={formValues.icon}
          label={formValues.labelPlural}
          onChange={({ iconKey }) =>
            setFormValues((previousFormValues) => ({
              ...previousFormValues,
              icon: iconKey,
            }))
          }
        />
        <SettingsObjectFormSection
          disabled={!activeMetadataObject.isCustom}
          singularName={formValues.labelSingular}
          pluralName={formValues.labelPlural}
          description={formValues.description}
          onChange={(values) =>
            setFormValues((previousFormValues) => ({
              ...previousFormValues,
              ...values,
            }))
          }
        />
        <Section>
          <H2Title title="Danger zone" description="Disable object" />
          <Button
            Icon={IconArchive}
            title="Disable"
            size="small"
            onClick={handleDisable}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
