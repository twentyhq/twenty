import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { isNonEmptyString } from '@sniptt/guards';
import omit from 'lodash.omit';
import pick from 'lodash.pick';
import { IconArchive, IconSettings } from 'twenty-ui';
import { v4 } from 'uuid';
import { z } from 'zod';

import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { useUpdateOneFieldMetadataItem } from '@/object-metadata/hooks/useUpdateOneFieldMetadataItem';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemInput } from '@/object-metadata/utils/formatFieldMetadataItemInput';
import { getFieldSlug } from '@/object-metadata/utils/getFieldSlug';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsDataModelFieldAboutForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldAboutForm';
import { SettingsDataModelFieldSettingsFormCard } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { SettingsDataModelFieldTypeSelect } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldTypeSelect';
import { settingsFieldFormSchema } from '@/settings/data-model/fields/forms/validation-schemas/settingsFieldFormSchema';
import { AppPath } from '@/types/AppPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { FieldMetadataType } from '~/generated-metadata/graphql';

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

  const { disableMetadataField } = useFieldMetadataItem();
  const activeMetadataField = activeObjectMetadataItem?.fields.find(
    (metadataField) =>
      metadataField.isActive && getFieldSlug(metadataField) === fieldSlug,
  );

  const getRelationMetadata = useGetRelationMetadata();
  const { relationFieldMetadataItem } =
    useMemo(
      () =>
        activeMetadataField
          ? getRelationMetadata({ fieldMetadataItem: activeMetadataField })
          : null,
      [activeMetadataField, getRelationMetadata],
    ) ?? {};

  const { updateOneFieldMetadataItem } = useUpdateOneFieldMetadataItem();

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

  const canSave = formConfig.formState.isValid && formConfig.formState.isDirty;

  const isLabelIdentifier = isLabelIdentifierField({
    fieldMetadataItem: activeMetadataField,
    objectMetadataItem: activeObjectMetadataItem,
  });

  const handleSave = async () => {
    const formValues = formConfig.getValues();
    const { dirtyFields } = formConfig.formState;

    try {
      if (
        formValues.type === FieldMetadataType.Relation &&
        'relation' in formValues &&
        'relation' in dirtyFields &&
        isNonEmptyString(relationFieldMetadataItem?.id)
      ) {
        await updateOneFieldMetadataItem({
          fieldMetadataIdToUpdate: relationFieldMetadataItem.id,
          updatePayload: formValues.relation.field,
        });
      }

      const otherDirtyFields = omit(dirtyFields, 'relation');

      if (Object.keys(otherDirtyFields).length > 0) {
        const formattedInput = pick(
          formatFieldMetadataItemInput(formValues),
          Object.keys(otherDirtyFields),
        );

        const options = formattedInput.options?.map((option) => ({
          ...option,
          id: option.id ?? v4(),
        }));

        await updateOneFieldMetadataItem({
          fieldMetadataIdToUpdate: activeMetadataField.id,
          updatePayload: { ...formattedInput, options },
        });
      }

      navigate(`/settings/objects/${objectSlug}`);
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: 'error',
      });
    }
  };

  const handleDisable = async () => {
    await disableMetadataField(activeMetadataField);
    navigate(`/settings/objects/${objectSlug}`);
  };

  const shouldDisplaySaveAndCancel =
    canPersistFieldMetadataItemUpdate(activeMetadataField);

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
                { children: activeMetadataField.label },
              ]}
            />
            {shouldDisplaySaveAndCancel && (
              <SaveAndCancelButtons
                isSaveDisabled={!canSave}
                onCancel={() => navigate(`/settings/objects/${objectSlug}`)}
                onSave={handleSave}
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
              relationFieldMetadataItem={relationFieldMetadataItem}
            />
          </Section>
          {!isLabelIdentifier && (
            <Section>
              <H2Title title="Danger zone" description="Disable this field" />
              <Button
                Icon={IconArchive}
                title="Disable"
                size="small"
                onClick={handleDisable}
              />
            </Section>
          )}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
