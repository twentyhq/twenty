import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Reference, useApolloClient } from '@apollo/client';
import styled from '@emotion/styled';
import { IconSettings } from 'twenty-ui';

import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { useCreateOneRelationMetadataItem } from '@/object-metadata/hooks/useCreateOneRelationMetadataItem';
import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFieldFormSection } from '@/settings/data-model/components/SettingsObjectFieldFormSection';
import { SettingsDataModelFieldSettingsFormCard } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { SettingsDataModelFieldTypeSelect } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldTypeSelect';
import { useFieldMetadataForm } from '@/settings/data-model/fields/forms/hooks/useFieldMetadataForm';
import { SettingsSupportedFieldType } from '@/settings/data-model/types/SettingsSupportedFieldType';
import { AppPath } from '@/types/AppPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const StyledSettingsObjectFieldTypeSelect = styled(
  SettingsDataModelFieldTypeSelect,
)`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsObjectNewFieldStep2 = () => {
  const navigate = useNavigate();
  const { objectSlug = '' } = useParams();
  const { enqueueSnackBar } = useSnackBar();
  const isMultiSelectEnabled = useIsFeatureEnabled('IS_MULTI_SELECT_ENABLED');

  const {
    findActiveObjectMetadataItemBySlug,
    findObjectMetadataItemById,
    findObjectMetadataItemByNamePlural,
  } = useFilteredObjectMetadataItems();

  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);
  const { createMetadataField } = useFieldMetadataItem();
  const cache = useApolloClient().cache;

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

  const { objectMetadataItem: viewObjectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  useFindManyRecords<View>({
    objectNameSingular: CoreObjectNameSingular.View,
    filter: {
      type: { eq: ViewType.Table },
      objectMetadataId: { eq: activeObjectMetadataItem?.id },
    },
    onCompleted: async (views) => {
      if (isUndefinedOrNull(views)) return;

      setObjectViews(views);
    },
  });

  useFindManyRecords<View>({
    objectNameSingular: CoreObjectNameSingular.View,
    skip: !formValues.relation?.objectMetadataId,
    filter: {
      type: { eq: ViewType.Table },
      objectMetadataId: { eq: formValues.relation?.objectMetadataId },
    },
    onCompleted: async (views) => {
      if (isUndefinedOrNull(views)) return;

      setRelationObjectViews(views);
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
            type: validatedFormValues.type,
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

        objectViews.map(async (view) => {
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

          modifyRecordFromCache({
            objectMetadataItem: viewObjectMetadataItem,
            cache: cache,
            fieldModifiers: {
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
            },
            recordId: view.id,
          });

          relationObjectViews.map(async (view) => {
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
            modifyRecordFromCache({
              objectMetadataItem: viewObjectMetadataItem,
              cache: cache,
              fieldModifiers: {
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
              },
              recordId: view.id,
            });
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
              : validatedFormValues.defaultValue,
          description: validatedFormValues.description,
          icon: validatedFormValues.icon,
          label: validatedFormValues.label ?? '',
          objectMetadataId: activeObjectMetadataItem.id,
          type: validatedFormValues.type,
          options:
            validatedFormValues.type === FieldMetadataType.Select
              ? validatedFormValues.select
              : validatedFormValues.type === FieldMetadataType.MultiSelect
                ? validatedFormValues.multiSelect
                : undefined,
        });

        objectViews.map(async (view) => {
          const viewFieldToCreate = {
            viewId: view.id,
            fieldMetadataId: createdMetadataField.data?.createOneField.id,
            position: activeObjectMetadataItem.fields.length,
            isVisible: true,
            size: 100,
          };

          modifyRecordFromCache({
            objectMetadataItem: viewObjectMetadataItem,
            cache: cache,
            fieldModifiers: {
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
            },
            recordId: view.id,
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

  const excludedFieldTypes: SettingsSupportedFieldType[] = [
    FieldMetadataType.Email,
    FieldMetadataType.FullName,
    FieldMetadataType.Link,
    FieldMetadataType.Numeric,
    FieldMetadataType.Probability,
    FieldMetadataType.Uuid,
  ];

  if (!isMultiSelectEnabled) {
    excludedFieldTypes.push(FieldMetadataType.MultiSelect);
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
          {!activeObjectMetadataItem.isRemote && (
            <SaveAndCancelButtons
              isSaveDisabled={!canSave}
              onCancel={() => navigate(`/settings/objects/${objectSlug}`)}
              onSave={handleSave}
            />
          )}
        </SettingsHeaderContainer>
        <SettingsObjectFieldFormSection
          iconKey={formValues.icon}
          name={formValues.label}
          description={formValues.description}
          onChange={handleFormChange}
        />
        <Section>
          <H2Title
            title="Type and values"
            description="The field's type and values."
          />
          <StyledSettingsObjectFieldTypeSelect
            excludedFieldTypes={excludedFieldTypes}
            onChange={handleFormChange}
            value={formValues.type}
          />
          <SettingsDataModelFieldSettingsFormCard
            fieldMetadataItem={{
              icon: formValues.icon,
              label: formValues.label || 'Employees',
              type: formValues.type,
            }}
            objectMetadataItem={activeObjectMetadataItem}
            onChange={handleFormChange}
            values={{
              currency: formValues.currency,
              relation: formValues.relation,
              select: formValues.select,
              multiSelect: formValues.multiSelect,
              defaultValue: formValues.defaultValue,
            }}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
