import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useMetadataField } from '@/metadata/hooks/useMetadataField';
import { useMetadataObjectForSettings } from '@/metadata/hooks/useMetadataObjectForSettings';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFieldFormSection } from '@/settings/data-model/components/SettingsObjectFieldFormSection';
import { SettingsObjectFieldTypeSelectSection } from '@/settings/data-model/components/SettingsObjectFieldTypeSelectSection';
import { MetadataFieldDataType } from '@/settings/data-model/types/ObjectFieldDataType';
import { AppPath } from '@/types/AppPath';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsObjectNewFieldStep2 = () => {
  const navigate = useNavigate();
  const { objectSlug = '' } = useParams();

  const { findActiveMetadataObjectBySlug, loading } =
    useMetadataObjectForSettings();

  const activeMetadataObject = findActiveMetadataObjectBySlug(objectSlug);
  const { createMetadataField } = useMetadataField();

  useEffect(() => {
    if (loading) return;
    if (!activeMetadataObject) navigate(AppPath.NotFound);
  }, [activeMetadataObject, loading, navigate]);

  const [formValues, setFormValues] = useState<{
    description?: string;
    icon: string;
    label: string;
    type: MetadataFieldDataType;
  }>({ icon: 'IconUsers', label: '', type: 'number' });

  if (!activeMetadataObject) return null;

  const canSave = !!formValues.label;

  const handleSave = async () => {
    await createMetadataField({
      ...formValues,
      objectId: activeMetadataObject.id,
    });
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
                children: activeMetadataObject.labelPlural,
                href: `/settings/objects/${objectSlug}`,
              },
              { children: 'New Field' },
            ]}
          />
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            onCancel={() => navigate(`/settings/objects/${objectSlug}`)}
            onSave={handleSave}
          />
        </SettingsHeaderContainer>
        <SettingsObjectFieldFormSection
          iconKey={formValues.icon}
          name={formValues.label}
          description={formValues.description}
          onChange={(values) =>
            setFormValues((previousValues) => ({
              ...previousValues,
              ...values,
            }))
          }
        />
        <SettingsObjectFieldTypeSelectSection
          type={formValues.type}
          onChange={(type) =>
            setFormValues((previousValues) => ({ ...previousValues, type }))
          }
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
