import { useCreateOneRelationMetadataItem } from '@/object-metadata/hooks/useCreateOneRelationMetadataItem';
import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsDataModelNewFieldBreadcrumbDropDown } from '@/settings/data-model/components/SettingsDataModelNewFieldBreadcrumbDropDown';
import { FIELD_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/FieldNameMaximumLength';
import { SettingsDataModelFieldDescriptionForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldDescriptionForm';
import { SettingsDataModelFieldIconLabelForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIconLabelForm';
import { SettingsDataModelFieldSettingsFormCard } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { SettingsDataModelFieldTypeSelect } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldTypeSelect';
import { settingsFieldFormSchema } from '@/settings/data-model/fields/forms/validation-schemas/settingsFieldFormSchema';
import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';
import { useApolloClient } from '@apollo/client';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import pick from 'lodash.pick';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { H1Title, H1TitleFontColor, H2Title, IconHierarchy2 } from 'twenty-ui';
import { z } from 'zod';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

// TODO: fix this type
type SettingsDataModelNewFieldFormValues = z.infer<
  ReturnType<typeof settingsFieldFormSchema>
> &
  any;

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
  padding-top: ${({ theme }) => theme.spacing(3)};
`;
export const SettingsObjectNewFieldStep2 = () => {
  const navigate = useNavigate();
  const { objectSlug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const fieldType = searchParams.get('fieldType') as SettingsFieldType;
  const { enqueueSnackBar } = useSnackBar();

  const [isConfigureStep, setIsConfigureStep] = useState(false);
  const { findActiveObjectMetadataItemBySlug } =
    useFilteredObjectMetadataItems();

  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);
  const { createMetadataField } = useFieldMetadataItem();

  const formConfig = useForm<SettingsDataModelNewFieldFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(
      settingsFieldFormSchema(
        activeObjectMetadataItem?.fields.map((value) => value.name),
      ),
    ),
  });

  useEffect(() => {
    if (!activeObjectMetadataItem) {
      navigate(AppPath.NotFound);
    }
  }, [activeObjectMetadataItem, navigate]);

  const [, setObjectViews] = useState<View[]>([]);
  const [, setRelationObjectViews] = useState<View[]>([]);

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

  const apolloClient = useApolloClient();

  if (!activeObjectMetadataItem) return null;

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const handleSave = async (
    formValues: SettingsDataModelNewFieldFormValues,
  ) => {
    try {
      if (
        formValues.type === FieldMetadataType.Relation &&
        'relation' in formValues
      ) {
        const { relation: relationFormValues, ...fieldFormValues } = formValues;

        await createOneRelationMetadata({
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
      } else {
        await createMetadataField({
          ...formValues,
          objectMetadataId: activeObjectMetadataItem.id,
        });
      }

      navigate(`/settings/objects/${objectSlug}`);

      // TODO: fix optimistic update logic
      // Forcing a refetch for now but it's not ideal
      await apolloClient.refetchQueries({
        include: ['FindManyViews', 'CombinedFindManyRecords'],
      });
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const excludedFieldTypes: SettingsFieldType[] = (
    [
      FieldMetadataType.Link,
      FieldMetadataType.Numeric,
      FieldMetadataType.RichText,
      FieldMetadataType.Actor,
      FieldMetadataType.Email,
      FieldMetadataType.Phone,
    ] as const
  ).filter(isDefined);

  return (
    <RecordFieldValueSelectorContextProvider>
      <FormProvider // eslint-disable-next-line react/jsx-props-no-spreading
        {...formConfig}
      >
        <SubMenuTopBarContainer
          Icon={IconHierarchy2}
          links={[
            {
              children: 'Objects',
              href: '/settings/objects',
            },
            {
              children: activeObjectMetadataItem.labelPlural,
              href: `/settings/objects/${objectSlug}`,
            },
            {
              children: (
                <SettingsDataModelNewFieldBreadcrumbDropDown
                  isConfigureStep={isConfigureStep}
                  onBreadcrumbClick={setIsConfigureStep}
                />
              ),
            },
          ]}
          actionButton={
            !activeObjectMetadataItem.isRemote && (
              <SaveAndCancelButtons
                isSaveDisabled={!canSave}
                isCancelDisabled={isSubmitting}
                onCancel={() => {
                  if (!isConfigureStep) {
                    navigate(`/settings/objects/${objectSlug}`);
                  } else {
                    setIsConfigureStep(false);
                  }
                }}
                onSave={formConfig.handleSubmit(handleSave)}
              />
            )
          }
        >
          <SettingsPageContainer>
            <StyledH1Title
              title={
                !isConfigureStep
                  ? '1. Select a field type'
                  : '2. Configure field'
              }
              fontColor={H1TitleFontColor.Primary}
            />

            {!isConfigureStep ? (
              <SettingsDataModelFieldTypeSelect
                excludedFieldTypes={excludedFieldTypes}
                fieldMetadataItem={{
                  type: fieldType as FieldMetadataType,
                }}
                onFieldTypeSelect={() => setIsConfigureStep(true)}
              />
            ) : (
              <>
                <Section>
                  <H2Title
                    title="Icon and Name"
                    description="The name and icon of this field"
                  />
                  <SettingsDataModelFieldIconLabelForm
                    maxLength={FIELD_NAME_MAXIMUM_LENGTH}
                  />
                </Section>
                <Section>
                  <H2Title
                    title="Values"
                    description="The values of this field"
                  />

                  <SettingsDataModelFieldSettingsFormCard
                    isCreatingField
                    fieldMetadataItem={{
                      icon: formConfig.watch('icon'),
                      label: formConfig.watch('label') || 'Employees',
                      type: formConfig.watch('type'),
                    }}
                    objectMetadataItem={activeObjectMetadataItem}
                  />
                </Section>
                <Section>
                  <H2Title
                    title="Description"
                    description="The description of this field"
                  />
                  <SettingsDataModelFieldDescriptionForm />
                </Section>
              </>
            )}
          </SettingsPageContainer>
        </SubMenuTopBarContainer>
      </FormProvider>
    </RecordFieldValueSelectorContextProvider>
  );
};
