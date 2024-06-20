import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import omit from 'lodash.omit';
import pick from 'lodash.pick';
import { H2Title, IconArchive, IconSettings } from 'twenty-ui';
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
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsDataModelFieldAboutForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldAboutForm';
import { SettingsDataModelFieldSettingsFormCard } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { SettingsDataModelFieldTypeSelect } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldTypeSelect';
import { settingsFieldFormSchema } from '@/settings/data-model/fields/forms/validation-schemas/settingsFieldFormSchema';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

type SettingsDataModelFieldEditFormValues = z.infer<
  typeof settingsFieldFormSchema
>;

const StyledSettingsObjectFieldTypeSelect = styled(
  SettingsDataModelFieldTypeSelect,
)`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

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
  const { findActiveObjectMetadataItemBySlug } =
    useFilteredObjectMetadataItems();

  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);

  const { deactivateMetadataField } = useFieldMetadataItem();
  const activeMetadataField = activeObjectMetadataItem?.fields.find(
    (metadataField) =>
      metadataField.isActive && getFieldSlug(metadataField) === fieldSlug,
  );

  const getRelationMetadata = useGetRelationMetadata();
  const { updateOneFieldMetadataItem } = useUpdateOneFieldMetadataItem();

  const apolloClient = useApolloClient();

  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular: activeObjectMetadataItem?.nameSingular || '',
  });

  const refetchRecords = async () => {
    if (!activeObjectMetadataItem) return;
    await apolloClient.query({
      query: findManyRecordsQuery,
      fetchPolicy: 'network-only',
    });
  };

  const formConfig = useForm<SettingsDataModelFieldEditFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsFieldFormSchema),
  });

  useEffect(() => {
    if (!activeObjectMetadataItem || !activeMetadataField) {
      navigate(AppPath.NotFound);
    }
  }, [activeMetadataField, activeObjectMetadataItem, navigate]);

  if (!activeObjectMetadataItem || !activeMetadataField) return null;

  const canSave =
    formConfig.formState.isValid &&
    formConfig.formState.isDirty &&
    !formConfig.formState.isSubmitting;

  const isLabelIdentifier = isLabelIdentifierField({
    fieldMetadataItem: activeMetadataField,
    objectMetadataItem: activeObjectMetadataItem,
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
            fieldMetadataItem: activeMetadataField,
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
          fieldMetadataIdToUpdate: activeMetadataField.id,
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
    await deactivateMetadataField(activeMetadataField);
    navigate(`/settings/objects/${objectSlug}`);
  };

  const shouldDisplaySaveAndCancel =
    canPersistFieldMetadataItemUpdate(activeMetadataField);

  return (
    <RecordFieldValueSelectorContextProvider>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
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
                  { children: activeMetadataField.label },
                ]}
              />
              {shouldDisplaySaveAndCancel && (
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
              <SettingsDataModelFieldAboutForm
                disabled={!activeMetadataField.isCustom}
                fieldMetadataItem={activeMetadataField}
              />
            </Section>
            <Section>
              <H2Title
                title="Type and values"
                description="The field's type and values."
              />
              <StyledSettingsObjectFieldTypeSelect
                disabled
                fieldMetadataItem={activeMetadataField}
              />
              <SettingsDataModelFieldSettingsFormCard
                disableCurrencyForm
                fieldMetadataItem={activeMetadataField}
                objectMetadataItem={activeObjectMetadataItem}
              />
            </Section>
            {!isLabelIdentifier && (
              <Section>
                <H2Title
                  title="Danger zone"
                  description="Deactivate this field"
                />
                <Button
                  Icon={IconArchive}
                  title="Deactivate"
                  size="small"
                  onClick={handleDeactivate}
                />
              </Section>
            )}
          </SettingsPageContainer>
        </SubMenuTopBarContainer>
      </FormProvider>
    </RecordFieldValueSelectorContextProvider>
  );
};
