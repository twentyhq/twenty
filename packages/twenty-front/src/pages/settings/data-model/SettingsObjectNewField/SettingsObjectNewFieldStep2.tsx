import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Reference, useApolloClient } from '@apollo/client';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import pick from 'lodash.pick';
import { IconSettings } from 'twenty-ui';
import { z } from 'zod';

import { useCreateOneRelationMetadataItem } from '@/object-metadata/hooks/useCreateOneRelationMetadataItem';
import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsDataModelFieldAboutForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldAboutForm';
import { SettingsDataModelFieldSettingsFormCard } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { SettingsDataModelFieldTypeSelect } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldTypeSelect';
import { settingsFieldFormSchema } from '@/settings/data-model/fields/forms/validation-schemas/settingsFieldFormSchema';
import { SettingsSupportedFieldType } from '@/settings/data-model/types/SettingsSupportedFieldType';
import { AppPath } from '@/types/AppPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type SettingsDataModelNewFieldFormValues = z.infer<
  typeof settingsFieldFormSchema
>;

const StyledSettingsObjectFieldTypeSelect = styled(
  SettingsDataModelFieldTypeSelect,
)`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsObjectNewFieldStep2 = () => {
  const navigate = useNavigate();
  const { objectSlug = '' } = useParams();
  const { enqueueSnackBar } = useSnackBar();

  const { findActiveObjectMetadataItemBySlug, findObjectMetadataItemById } =
    useFilteredObjectMetadataItems();

  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);
  const { createMetadataField } = useFieldMetadataItem();
  const cache = useApolloClient().cache;

  const formConfig = useForm<SettingsDataModelNewFieldFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsFieldFormSchema),
  });

  useEffect(() => {
    if (!activeObjectMetadataItem) {
      navigate(AppPath.NotFound);
    }
  }, [activeObjectMetadataItem, navigate]);

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

  const relationObjectMetadataId = formConfig.watch(
    'relation.objectMetadataId',
  );

  useFindManyRecords<View>({
    objectNameSingular: CoreObjectNameSingular.View,
    skip: !relationObjectMetadataId,
    filter: {
      type: { eq: ViewType.Table },
      objectMetadataId: { eq: relationObjectMetadataId },
    },
    onCompleted: async (views) => {
      if (isUndefinedOrNull(views)) return;

      setRelationObjectViews(views);
    },
  });

  const { createOneRelationMetadataItem: createOneRelationMetadata } =
    useCreateOneRelationMetadataItem();

  if (!activeObjectMetadataItem) return null;

  const canSave =
    formConfig.formState.isValid && !formConfig.formState.isSubmitting;

  const handleSave = async (
    formValues: SettingsDataModelNewFieldFormValues,
  ) => {
    try {
      if (
        formValues.type === FieldMetadataType.Relation &&
        'relation' in formValues
      ) {
        const { relation: relationFormValues, ...fieldFormValues } = formValues;

        const createdRelation = await createOneRelationMetadata({
          relationType: relationFormValues.type,
          field: pick(fieldFormValues, ['icon', 'label', 'description']),
          objectMetadataId: activeObjectMetadataItem.id,
          connect: {
            field: {
              icon: relationFormValues.field.icon,
              label: relationFormValues.field.label,
            },
            objectMetadataId: relationFormValues.objectMetadataId,
          },
        });

        const relationObjectMetadataItem = findObjectMetadataItemById(
          relationFormValues.objectMetadataId,
        );

        objectViews.map(async (view) => {
          const viewFieldToCreate = {
            viewId: view.id,
            fieldMetadataId:
              relationFormValues.type === 'MANY_TO_ONE'
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
                relationFormValues.type === 'MANY_TO_ONE'
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
          ...formValues,
          defaultValue:
            formValues.type === FieldMetadataType.Currency &&
            'defaultValue' in formValues
              ? {
                  ...formValues.defaultValue,
                  amountMicros: null,
                }
              : 'defaultValue' in formValues
                ? formValues.defaultValue
                : undefined,
          objectMetadataId: activeObjectMetadataItem.id,
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
                const edges = readField<RecordGqlRefEdge[]>(
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
    // FieldMetadataType.Links,
    FieldMetadataType.Numeric,
    FieldMetadataType.Probability,
    FieldMetadataType.Uuid,
    FieldMetadataType.Phone,
  ];

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
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
                onSave={formConfig.handleSubmit(handleSave)}
              />
            )}
          </SettingsHeaderContainer>
          <Section>
            <H2Title
              title="Name and description"
              description="The name and description of this field"
            />
            <SettingsDataModelFieldAboutForm />
          </Section>
          <Section>
            <H2Title
              title="Type and values"
              description="The field's type and values."
            />
            <StyledSettingsObjectFieldTypeSelect
              excludedFieldTypes={excludedFieldTypes}
            />
            <SettingsDataModelFieldSettingsFormCard
              fieldMetadataItem={{
                icon: formConfig.watch('icon'),
                label: formConfig.watch('label') || 'Employees',
                type: formConfig.watch('type'),
              }}
              objectMetadataItem={activeObjectMetadataItem}
            />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
