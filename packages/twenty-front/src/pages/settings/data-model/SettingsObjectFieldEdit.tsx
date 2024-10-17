import { useApolloClient } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import omit from 'lodash.omit';
import pick from 'lodash.pick';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { H2Title, IconArchive, IconArchiveOff } from 'twenty-ui';
import { z } from 'zod';

import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { useUpdateOneFieldMetadataItem } from '@/object-metadata/hooks/useUpdateOneFieldMetadataItem';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemInput } from '@/object-metadata/utils/formatFieldMetadataItemInput';
import { getFieldSlug } from '@/object-metadata/utils/getFieldSlug';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { FIELD_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/FieldNameMaximumLength';
import { SettingsDataModelFieldDescriptionForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldDescriptionForm';
import { SettingsDataModelFieldIconLabelForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIconLabelForm';
import { SettingsDataModelFieldSettingsFormCard } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { settingsFieldFormSchema } from '@/settings/data-model/fields/forms/validation-schemas/settingsFieldFormSchema';
import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

//TODO: fix this type
type SettingsDataModelFieldEditFormValues = z.infer<
  ReturnType<typeof settingsFieldFormSchema>
> &
  any;

const canPersistFieldMetadataItemUpdate = (
  fieldMetadataItem: FieldMetadataItem,
) => {
  return (
    fieldMetadataItem.isCustom ||
    fieldMetadataItem.type === FieldMetadataType.Select ||
    fieldMetadataItem.type === FieldMetadataType.MultiSelect
  );
};

export const SettingsObjectFieldEdit = () => {
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();

  const { objectSlug = '', fieldSlug = '' } = useParams();
  const { findObjectMetadataItemBySlug } = useFilteredObjectMetadataItems();

  const objectMetadataItem = findObjectMetadataItemBySlug(objectSlug);

  const { deactivateMetadataField, activateMetadataField } =
    useFieldMetadataItem();

  const fieldMetadataItem = objectMetadataItem?.fields.find(
    (fieldMetadataItem) => getFieldSlug(fieldMetadataItem) === fieldSlug,
  );

  const getRelationMetadata = useGetRelationMetadata();
  const { updateOneFieldMetadataItem } = useUpdateOneFieldMetadataItem();

  const apolloClient = useApolloClient();

  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular: objectMetadataItem?.nameSingular || '',
  });

  const refetchRecords = async () => {
    if (!objectMetadataItem) return;
    await apolloClient.query({
      query: findManyRecordsQuery,
      fetchPolicy: 'network-only',
    });
  };

  const formConfig = useForm<SettingsDataModelFieldEditFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsFieldFormSchema()),
    values: {
      icon: fieldMetadataItem?.icon ?? 'Icon',
      type: fieldMetadataItem?.type as SettingsFieldType,
      label: fieldMetadataItem?.label ?? '',
      description: fieldMetadataItem?.description,
    },
  });

  useEffect(() => {
    if (!objectMetadataItem || !fieldMetadataItem) {
      navigate(AppPath.NotFound);
    }
  }, [fieldMetadataItem, objectMetadataItem, navigate]);

  const { isDirty, isValid, isSubmitting } = formConfig.formState;
  const canSave = isDirty && isValid && !isSubmitting;

  if (!isDefined(objectMetadataItem) || !isDefined(fieldMetadataItem)) {
    return null;
  }

  const isLabelIdentifier = isLabelIdentifierField({
    fieldMetadataItem: fieldMetadataItem,
    objectMetadataItem: objectMetadataItem,
  });

  const handleSave = async (
    formValues: SettingsDataModelFieldEditFormValues,
  ) => {
    const { dirtyFields } = formConfig.formState;

    try {
      if (
        formValues.type === FieldMetadataType.Relation &&
        'relation' in formValues &&
        'relation' in dirtyFields
      ) {
        const { relationFieldMetadataItem } =
          getRelationMetadata({
            fieldMetadataItem: fieldMetadataItem,
          }) ?? {};

        if (isDefined(relationFieldMetadataItem)) {
          await updateOneFieldMetadataItem({
            fieldMetadataIdToUpdate: relationFieldMetadataItem.id,
            updatePayload: formValues.relation.field,
          });
        }
      }

      const otherDirtyFields = omit(dirtyFields, 'relation');

      if (Object.keys(otherDirtyFields).length > 0) {
        const formattedInput = pick(
          formatFieldMetadataItemInput(formValues),
          Object.keys(otherDirtyFields),
        );

        await updateOneFieldMetadataItem({
          fieldMetadataIdToUpdate: fieldMetadataItem.id,
          updatePayload: formattedInput,
        });
      }

      navigate(`/settings/objects/${objectSlug}`);

      refetchRecords();
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const handleDeactivate = async () => {
    await deactivateMetadataField(fieldMetadataItem);
    navigate(`/settings/objects/${objectSlug}`);
  };

  const handleActivate = async () => {
    await activateMetadataField(fieldMetadataItem);
    navigate(`/settings/objects/${objectSlug}`);
  };

  const shouldDisplaySaveAndCancel =
    canPersistFieldMetadataItemUpdate(fieldMetadataItem);

  return (
    <RecordFieldValueSelectorContextProvider>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <FormProvider {...formConfig}>
        <SubMenuTopBarContainer
          title={fieldMetadataItem?.label}
          links={[
            {
              children: 'Workspace',
              href: getSettingsPagePath(SettingsPath.Workspace),
            },
            {
              children: 'Objects',
              href: '/settings/objects',
            },
            {
              children: objectMetadataItem.labelPlural,
              href: `/settings/objects/${objectSlug}`,
            },
            {
              children: fieldMetadataItem.label,
            },
          ]}
          actionButton={
            shouldDisplaySaveAndCancel && (
              <SaveAndCancelButtons
                isSaveDisabled={!canSave}
                isCancelDisabled={isSubmitting}
                onCancel={() => navigate(`/settings/objects/${objectSlug}`)}
                onSave={formConfig.handleSubmit(handleSave)}
              />
            )
          }
        >
          <SettingsPageContainer>
            <Section>
              <H2Title
                title="Icon and Name"
                description="The name and icon of this field"
              />
              <SettingsDataModelFieldIconLabelForm
                disabled={!fieldMetadataItem.isCustom}
                fieldMetadataItem={fieldMetadataItem}
                maxLength={FIELD_NAME_MAXIMUM_LENGTH}
              />
            </Section>
            <Section>
              {fieldMetadataItem.isUnique ? (
                <H2Title
                  title="Values"
                  description="The values of this field must be unique"
                />
              ) : (
                <H2Title
                  title="Values"
                  description="The values of this field"
                />
              )}
              <SettingsDataModelFieldSettingsFormCard
                fieldMetadataItem={fieldMetadataItem}
                objectMetadataItem={objectMetadataItem}
              />
            </Section>
            <Section>
              <H2Title
                title="Description"
                description="The description of this field"
              />
              <SettingsDataModelFieldDescriptionForm
                disabled={!fieldMetadataItem.isCustom}
                fieldMetadataItem={fieldMetadataItem}
              />
            </Section>
            {!isLabelIdentifier && (
              <Section>
                <H2Title
                  title="Danger zone"
                  description="Deactivate this field"
                />
                <Button
                  Icon={
                    fieldMetadataItem.isActive ? IconArchive : IconArchiveOff
                  }
                  variant="secondary"
                  title={fieldMetadataItem.isActive ? 'Deactivate' : 'Activate'}
                  size="small"
                  onClick={
                    fieldMetadataItem.isActive
                      ? handleDeactivate
                      : handleActivate
                  }
                />
              </Section>
            )}
          </SettingsPageContainer>
        </SubMenuTopBarContainer>
      </FormProvider>
    </RecordFieldValueSelectorContextProvider>
  );
};
