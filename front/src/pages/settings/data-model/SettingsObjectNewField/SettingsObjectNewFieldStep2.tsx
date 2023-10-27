import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useFieldMetadata } from '@/metadata/hooks/useFieldMetadata';
import { useObjectMetadata } from '@/metadata/hooks/useObjectMetadata';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFieldFormSection } from '@/settings/data-model/components/SettingsObjectFieldFormSection';
import { SettingsObjectFieldTypeSelectSection } from '@/settings/data-model/components/SettingsObjectFieldTypeSelectSection';
import { ObjectFieldDataType } from '@/settings/data-model/types/ObjectFieldDataType';
import { AppPath } from '@/types/AppPath';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsObjectNewFieldStep2 = () => {
  const navigate = useNavigate();
  const { objectSlug = '' } = useParams();
  const { findActiveObjectBySlug, loading } = useObjectMetadata();
  const activeObject = findActiveObjectBySlug(objectSlug);
  const { createField } = useFieldMetadata();

  useEffect(() => {
    if (loading) return;
    if (!activeObject) navigate(AppPath.NotFound);
  }, [activeObject, loading, navigate]);

  const [formValues, setFormValues] = useState<{
    description?: string;
    icon: string;
    label: string;
    type: ObjectFieldDataType;
  }>({ icon: 'IconUsers', label: '', type: 'number' });

  if (!activeObject) return null;

  const canSave = !!formValues.label;

  const handleSave = async () => {
    await createField({ ...formValues, objectId: activeObject.id });
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
