import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { useCreateOneObjectRecord } from '@/object-record/hooks/useCreateOneObjectRecord';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { PaginatedObjectTypeResults } from '@/object-record/types/PaginatedObjectTypeResults';
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
import { View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';

export const SettingsObjectNewFieldStep2 = () => {
  const navigate = useNavigate();
  const { objectSlug = '' } = useParams();

  const { findActiveObjectMetadataItemBySlug, loading } =
    useObjectMetadataItemForSettings();

  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);
  const { createMetadataField } = useFieldMetadataItem();

  useEffect(() => {
    if (loading) return;
    if (!activeObjectMetadataItem) navigate(AppPath.NotFound);
  }, [activeObjectMetadataItem, loading, navigate]);

  const [formValues, setFormValues] = useState<{
    description?: string;
    icon: string;
    label: string;
    type: MetadataFieldDataType;
  }>({ icon: 'IconUsers', label: '', type: 'NUMBER' });

  const [objectViews, setObjectViews] = useState<View[]>([]);

  const { createOneObject: createOneViewField } = useCreateOneObjectRecord({
    objectNamePlural: 'viewFieldsV2',
  });

  useFindManyObjectRecords({
    objectNamePlural: 'viewsV2',
    filter: {
      type: { eq: ViewType.Table },
      objectMetadataId: { eq: activeObjectMetadataItem?.id },
    },
    onCompleted: async (data: PaginatedObjectTypeResults<View>) => {
      const views = data.edges;

      if (!views) {
        return;
      }

      setObjectViews(data.edges.map(({ node }) => node));
    },
  });

  if (!activeObjectMetadataItem || !objectViews.length) return null;

  const canSave = !!formValues.label;

  const handleSave = async () => {
    const createdField = await createMetadataField({
      ...formValues,
      objectMetadataId: activeObjectMetadataItem.id,
    });
    objectViews.forEach(async (view) => {
      await createOneViewField?.({
        view: view.id,
        fieldMetadataId: createdField.data?.createOneField.id,
        position: activeObjectMetadataItem.fields.length,
        isVisible: true,
        size: 100,
      });
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
                children: activeObjectMetadataItem.labelPlural,
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
          fieldIconKey={formValues.icon}
          fieldLabel={formValues.label || 'Employees'}
          fieldType={formValues.type}
          isObjectCustom={activeObjectMetadataItem.isCustom}
          objectIconKey={activeObjectMetadataItem.icon}
          objectLabelPlural={activeObjectMetadataItem.labelPlural}
          objectNamePlural={activeObjectMetadataItem.namePlural}
          onChange={(type) =>
            setFormValues((previousValues) => ({ ...previousValues, type }))
          }
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
