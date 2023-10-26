import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useFieldMetadata } from '@/metadata/hooks/useFieldMetadata';
import { useObjectMetadata } from '@/metadata/hooks/useObjectMetadata';
import { getFieldSlug } from '@/metadata/utils/getFieldSlug';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFieldFormSection } from '@/settings/data-model/components/SettingsObjectFieldFormSection';
import { SettingsObjectFieldTypeSelectSection } from '@/settings/data-model/components/SettingsObjectFieldTypeSelectSection';
import { ObjectFieldDataType } from '@/settings/data-model/types/ObjectFieldDataType';
import { AppPath } from '@/types/AppPath';
import { IconArchive, IconSettings } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsObjectFieldEdit = () => {
  const navigate = useNavigate();

  const { objectSlug = '', fieldSlug = '' } = useParams();
  const { findActiveObjectBySlug, loading } = useObjectMetadata();
  const activeObject = findActiveObjectBySlug(objectSlug);

  const { disableField, editField } = useFieldMetadata();
  const activeField = activeObject?.fields.find(
    (field) => field.isActive && getFieldSlug(field) === fieldSlug,
  );

  const [formValues, setFormValues] = useState<
    Partial<{
      icon: string;
      label: string;
      description: string;
    }>
  >({});

  useEffect(() => {
    if (loading) return;

    if (!activeObject || !activeField) {
      navigate(AppPath.NotFound);
      return;
    }

    if (!Object.keys(formValues).length) {
      setFormValues({
        icon: activeField.icon ?? undefined,
        label: activeField.label,
        description: activeField.description ?? undefined,
      });
    }
  }, [activeField, activeObject, formValues, loading, navigate]);

  if (!activeObject || !activeField) return null;

  const areRequiredFieldsFilled = !!formValues.label;

  const hasChanges =
    formValues.description !== activeField.description ||
    formValues.icon !== activeField.icon ||
    formValues.label !== activeField.label;

  const canSave = areRequiredFieldsFilled && hasChanges;

  const handleSave = async () => {
    const editedField = { ...activeField, ...formValues };

    await editField(editedField);

    navigate(`/settings/objects/${objectSlug}`);
  };

  const handleDisable = async () => {
    await disableField(activeField);
    navigate(`/settings/objects/${objectSlug}`);
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'Objects', href: '/settings/objects' },
              {
                children: activeObject.labelPlural,
                href: `/settings/objects/${objectSlug}`,
              },
              { children: activeField.label },
            ]}
          />
          {activeField.isCustom && (
            <SaveAndCancelButtons
              isSaveDisabled={!canSave}
              onCancel={() => navigate(`/settings/objects/${objectSlug}`)}
              onSave={handleSave}
            />
          )}
        </SettingsHeaderContainer>
        <SettingsObjectFieldFormSection
          disabled={!activeField.isCustom}
          name={formValues.label}
          description={formValues.description}
          iconKey={formValues.icon}
          onChange={(values) =>
            setFormValues((previousFormValues) => ({
              ...previousFormValues,
              ...values,
            }))
          }
        />
        <SettingsObjectFieldTypeSelectSection
          disabled
          type={activeField.type as ObjectFieldDataType}
        />
        <Section>
          <H2Title title="Danger zone" description="Disable this field" />
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
