import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useCreateOneRelationMetadata } from '@/object-metadata/hooks/useCreateOneRelationMetadata';
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
import { useFieldMetadataForm } from '@/settings/data-model/hooks/useFieldMetadataForm';
import { AppPath } from '@/types/AppPath';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const SettingsObjectNewFieldStep2 = () => {
  const navigate = useNavigate();
  const { objectSlug = '' } = useParams();

  const {
    findActiveObjectMetadataItemBySlug,
    findObjectMetadataItemById,
    findObjectMetadataItemByNamePlural,
  } = useObjectMetadataItemForSettings();

  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);
  const { createMetadataField } = useFieldMetadataItem();

  const {
    formValues,
    handleFormChange,
    initForm,
    isValid: canSave,
    validatedFormValues,
  } = useFieldMetadataForm();

  useEffect(() => {
    if (!activeObjectMetadataItem) {
      navigate(AppPath.NotFound);
      return;
    }

    initForm({
      relation: {
        field: { icon: activeObjectMetadataItem.icon },
        objectMetadataId: findObjectMetadataItemByNamePlural('people')?.id,
      },
    });
  }, [
    activeObjectMetadataItem,
    findObjectMetadataItemByNamePlural,
    initForm,

    navigate,
  ]);

  const [objectViews, setObjectViews] = useState<View[]>([]);
  const [relationObjectViews, setRelationObjectViews] = useState<View[]>([]);

  const { createOneObject: createOneViewField } = useCreateOneObjectRecord({
    objectNameSingular: 'viewField',
  });

  useFindManyObjectRecords({
    objectNamePlural: 'views',
    filter: {
      type: { eq: ViewType.Table },
      objectMetadataId: { eq: activeObjectMetadataItem?.id },
    },
    onCompleted: async (data: PaginatedObjectTypeResults<View>) => {
      const views = data.edges;

      if (!views) return;

      setObjectViews(data.edges.map(({ node }) => node));
    },
  });

  useFindManyObjectRecords({
    objectNamePlural: 'views',
    skip: !formValues.relation?.objectMetadataId,
    filter: {
      type: { eq: ViewType.Table },
      objectMetadataId: { eq: formValues.relation?.objectMetadataId },
    },
    onCompleted: async (data: PaginatedObjectTypeResults<View>) => {
      const views = data.edges;

      if (!views) return;

      setRelationObjectViews(data.edges.map(({ node }) => node));
    },
  });

  const { createOneRelationMetadata } = useCreateOneRelationMetadata();

  if (!activeObjectMetadataItem) return null;

  const handleSave = async () => {
    if (!validatedFormValues) return;

    if (validatedFormValues.type === FieldMetadataType.Relation) {
      const createdRelation = await createOneRelationMetadata({
        relationType: validatedFormValues.relation.type,
        field: {
          description: validatedFormValues.description,
          icon: validatedFormValues.icon,
          label: validatedFormValues.label,
        },
        objectMetadataId: activeObjectMetadataItem.id,
        connect: {
          field: {
            icon: validatedFormValues.relation.field.icon,
            label: validatedFormValues.relation.field.label,
          },
          objectMetadataId: validatedFormValues.relation.objectMetadataId,
        },
      });

      const relationObjectMetadataItem = findObjectMetadataItemById(
        validatedFormValues.relation.objectMetadataId,
      );

      objectViews.forEach(async (view) => {
        await createOneViewField?.({
          view: view.id,
          fieldMetadataId:
            validatedFormValues.relation.type === 'MANY_TO_ONE'
              ? createdRelation.data?.createOneRelation.toFieldMetadataId
              : createdRelation.data?.createOneRelation.fromFieldMetadataId,
          position: activeObjectMetadataItem.fields.length,
          isVisible: true,
          size: 100,
        });
      });
      relationObjectViews.forEach(async (view) => {
        await createOneViewField?.({
          view: view.id,
          fieldMetadataId:
            validatedFormValues.relation.type === 'MANY_TO_ONE'
              ? createdRelation.data?.createOneRelation.fromFieldMetadataId
              : createdRelation.data?.createOneRelation.toFieldMetadataId,
          position: relationObjectMetadataItem?.fields.length,
          isVisible: true,
          size: 100,
        });
      });
    } else {
      await createMetadataField({
        description: validatedFormValues.description,
        icon: validatedFormValues.icon,
        label: validatedFormValues.label,
        objectMetadataId: activeObjectMetadataItem.id,
        type: validatedFormValues.type,
      });
    }

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
          onChange={handleFormChange}
        />
        <SettingsObjectFieldTypeSelectSection
          excludedFieldTypes={[
            FieldMetadataType.Currency,
            FieldMetadataType.Email,
            FieldMetadataType.Enum,
            FieldMetadataType.Numeric,
            FieldMetadataType.FullName,
            FieldMetadataType.Link,
            FieldMetadataType.Phone,
            FieldMetadataType.Probability,
            FieldMetadataType.Relation,
            FieldMetadataType.Uuid,
          ]}
          fieldMetadata={{
            icon: formValues.icon,
            label: formValues.label || 'Employees',
          }}
          objectMetadataId={activeObjectMetadataItem.id}
          onChange={handleFormChange}
          values={{
            type: formValues.type,
            relation: formValues.relation,
          }}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
