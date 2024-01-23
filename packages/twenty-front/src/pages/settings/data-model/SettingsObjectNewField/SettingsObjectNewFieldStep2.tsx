import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Reference } from '@apollo/client';

import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { useCreateOneRelationMetadataItem } from '@/object-metadata/hooks/useCreateOneRelationMetadataItem';
import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFieldFormSection } from '@/settings/data-model/components/SettingsObjectFieldFormSection';
import { SettingsObjectFieldTypeSelectSection } from '@/settings/data-model/components/SettingsObjectFieldTypeSelectSection';
import { useFieldMetadataForm } from '@/settings/data-model/hooks/useFieldMetadataForm';
import { AppPath } from '@/types/AppPath';
import { IconSettings } from '@/ui/display/icon';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const SettingsObjectNewFieldStep2 = () => {
  const navigate = useNavigate();
  const { objectSlug = '' } = useParams();
  const { enqueueSnackBar } = useSnackBar();

  const {
    findActiveObjectMetadataItemBySlug,
    findObjectMetadataItemById,
    findObjectMetadataItemByNamePlural,
  } = useObjectMetadataItemForSettings();

  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);
  const { createMetadataField } = useFieldMetadataItem();

  const isRatingFieldTypeEnabled = useIsFeatureEnabled(
    'IS_RATING_FIELD_TYPE_ENABLED',
  );

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
        objectMetadataId:
          findObjectMetadataItemByNamePlural('people')?.id || '',
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

  const { modifyRecordFromCache: modifyViewFromCache } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.View,
    filter: {
      type: { eq: ViewType.Table },
      objectMetadataId: { eq: activeObjectMetadataItem?.id },
    },
    onCompleted: async (data: ObjectRecordConnection<View>) => {
      const views = data.edges;

      if (!views) return;

      setObjectViews(data.edges.map(({ node }) => node));
    },
  });

  useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.View,
    skip: !formValues.relation?.objectMetadataId,
    filter: {
      type: { eq: ViewType.Table },
      objectMetadataId: { eq: formValues.relation?.objectMetadataId },
    },
    onCompleted: async (data: ObjectRecordConnection<View>) => {
      const views = data.edges;

      if (!views) return;

      setRelationObjectViews(data.edges.map(({ node }) => node));
    },
  });

  const { createOneRelationMetadataItem: createOneRelationMetadata } =
    useCreateOneRelationMetadataItem();

  if (!activeObjectMetadataItem) return null;

  const handleSave = async () => {
    if (!validatedFormValues) return;

    try {
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
          const viewFieldToCreate = {
            viewId: view.id,
            fieldMetadataId:
              validatedFormValues.relation.type === 'MANY_TO_ONE'
                ? createdRelation.data?.createOneRelation.toFieldMetadataId
                : createdRelation.data?.createOneRelation.fromFieldMetadataId,
            position: activeObjectMetadataItem.fields.length,
            isVisible: true,
            size: 100,
          };

          modifyViewFromCache(view.id, {
            viewFields: (viewFieldsRef, { readField }) => {
              const edges = readField<{ node: Reference }[]>(
                'edges',
                viewFieldsRef,
              );

              if (!edges) return viewFieldsRef;

              return {
                ...viewFieldsRef,
                edges: [...edges, { node: viewFieldToCreate }],
              };
            },
          });
        });
        relationObjectViews.forEach(async (view) => {
          const viewFieldToCreate = {
            viewId: view.id,
            fieldMetadataId:
              validatedFormValues.relation.type === 'MANY_TO_ONE'
                ? createdRelation.data?.createOneRelation.fromFieldMetadataId
                : createdRelation.data?.createOneRelation.toFieldMetadataId,
            position: relationObjectMetadataItem?.fields.length,
            isVisible: true,
            size: 100,
          };
          modifyViewFromCache(view.id, {
            viewFields: (viewFieldsRef, { readField }) => {
              const edges = readField<{ node: Reference }[]>(
                'edges',
                viewFieldsRef,
              );

              if (!edges) return viewFieldsRef;

              return {
                ...viewFieldsRef,
                edges: [...edges, { node: viewFieldToCreate }],
              };
            },
          });
        });
      } else {
        const createdMetadataField = await createMetadataField({
          defaultValue:
            validatedFormValues.type === FieldMetadataType.Currency
              ? {
                  amountMicros: null,
                  currencyCode: validatedFormValues.currency.currencyCode,
                }
              : undefined,
          description: validatedFormValues.description,
          icon: validatedFormValues.icon,
          label: validatedFormValues.label ?? '',
          objectMetadataId: activeObjectMetadataItem.id,
          type: validatedFormValues.type,
          options:
            validatedFormValues.type === FieldMetadataType.Select
              ? validatedFormValues.select
              : undefined,
        });

        objectViews.forEach(async (view) => {
          const viewFieldToCreate = {
            viewId: view.id,
            fieldMetadataId: createdMetadataField.data?.createOneField.id,
            position: activeObjectMetadataItem.fields.length,
            isVisible: true,
            size: 100,
          };

          modifyViewFromCache(view.id, {
            viewFields: (cachedViewFieldsConnection, { readField }) => {
              const edges = readField<CachedObjectRecordEdge[]>(
                'edges',
                cachedViewFieldsConnection,
              );

              if (!edges) return cachedViewFieldsConnection;

              return {
                ...cachedViewFieldsConnection,
                edges: [...edges, { node: viewFieldToCreate }],
              };
            },
          });
        });
      }

      navigate(`/settings/objects/${objectSlug}`);
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: 'error',
      });
    }
  };

  const excludedFieldTypes = [
    FieldMetadataType.Currency,
    FieldMetadataType.Email,
    FieldMetadataType.FullName,
    FieldMetadataType.Link,
    FieldMetadataType.MultiSelect,
    FieldMetadataType.Numeric,
    FieldMetadataType.Phone,
    FieldMetadataType.Probability,
    FieldMetadataType.Uuid,
  ];

  if (!isRatingFieldTypeEnabled) {
    excludedFieldTypes.push(FieldMetadataType.Rating);
  }

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
          excludedFieldTypes={excludedFieldTypes}
          fieldMetadata={{
            icon: formValues.icon,
            label: formValues.label || 'Employees',
          }}
          objectMetadataId={activeObjectMetadataItem.id}
          onChange={handleFormChange}
          values={{
            type: formValues.type,
            currency: formValues.currency,
            relation: formValues.relation,
            select: formValues.select,
          }}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
