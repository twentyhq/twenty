import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { isNonEmptyString } from '@sniptt/guards';
import { IconArchive, IconSettings } from 'twenty-ui';
import { z } from 'zod';

import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldSlug } from '@/object-metadata/utils/getFieldSlug';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFieldCurrencyFormValues } from '@/settings/data-model/components/SettingsObjectFieldCurrencyForm';
import { SettingsDataModelFieldAboutForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldAboutForm';
import { SettingsDataModelFieldSettingsFormCard } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { SettingsDataModelFieldTypeSelect } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldTypeSelect';
import { useFieldMetadataForm } from '@/settings/data-model/fields/forms/hooks/useFieldMetadataForm';
import { settingsFieldFormSchema } from '@/settings/data-model/fields/forms/validation-schemas/settingsFieldFormSchema';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { AppPath } from '@/types/AppPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import {
  FieldMetadataType,
  RelationMetadataType,
} from '~/generated-metadata/graphql';

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

  const { disableMetadataField, editMetadataField } = useFieldMetadataItem();
  const activeMetadataField = activeObjectMetadataItem?.fields.find(
    (metadataField) =>
      metadataField.isActive && getFieldSlug(metadataField) === fieldSlug,
  );

  const getRelationMetadata = useGetRelationMetadata();
  const {
    relationFieldMetadataItem,
    relationObjectMetadataItem,
    relationType,
  } =
    useMemo(
      () =>
        activeMetadataField
          ? getRelationMetadata({
              fieldMetadataItem: activeMetadataField,
            })
          : null,
      [activeMetadataField, getRelationMetadata],
    ) ?? {};

  const formConfig = useForm<SettingsDataModelFieldEditFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsFieldFormSchema),
  });

  const {
    formValues,
    handleFormChange,
    hasFieldFormChanged,
    hasDefaultValueChanged,
    hasFormChanged,
    hasRelationFormChanged,
    hasSelectFormChanged,
    hasMultiSelectFormChanged,
    initForm,
    isInitialized,
    isValid,
    validatedFormValues,
  } = useFieldMetadataForm();

  useEffect(() => {
    if (!activeObjectMetadataItem || !activeMetadataField) {
      navigate(AppPath.NotFound);
      return;
    }

    const { defaultValue } = activeMetadataField;

    const currencyDefaultValue =
      activeMetadataField.type === FieldMetadataType.Currency
        ? (defaultValue as SettingsObjectFieldCurrencyFormValues | undefined)
        : undefined;

    const selectOptions = activeMetadataField.options?.map((option) => ({
      ...option,
      isDefault: defaultValue === `'${option.value}'`,
    }));
    selectOptions?.sort(
      (optionA, optionB) => optionA.position - optionB.position,
    );

    const multiSelectOptions = activeMetadataField.options?.map((option) => ({
      ...option,
      isDefault: defaultValue?.includes(`'${option.value}'`) || false,
    }));
    multiSelectOptions?.sort(
      (optionA, optionB) => optionA.position - optionB.position,
    );

    const fieldType = activeMetadataField.type;
    const isFieldTypeSupported = isFieldTypeSupportedInSettings(fieldType);

    if (!isFieldTypeSupported) return;

    initForm({
      type: fieldType,
      ...(currencyDefaultValue ? { currency: currencyDefaultValue } : {}),
      relation: {
        field: {
          icon: relationFieldMetadataItem?.icon,
          label: relationFieldMetadataItem?.label || '',
        },
        objectMetadataId: relationObjectMetadataItem?.id || '',
        type: relationType || RelationMetadataType.OneToMany,
      },
      defaultValue: activeMetadataField.defaultValue,
      ...(selectOptions?.length ? { select: selectOptions } : {}),
      ...(multiSelectOptions?.length
        ? { multiSelect: multiSelectOptions }
        : {}),
    });
  }, [
    activeMetadataField,
    activeObjectMetadataItem,
    initForm,
    navigate,
    relationFieldMetadataItem?.icon,
    relationFieldMetadataItem?.label,
    relationObjectMetadataItem?.id,
    relationType,
  ]);

  if (!isInitialized || !activeObjectMetadataItem || !activeMetadataField)
    return null;

  const canSave =
    formConfig.formState.isValid &&
    isValid &&
    (formConfig.formState.isDirty || hasFormChanged);

  const isLabelIdentifier = isLabelIdentifierField({
    fieldMetadataItem: activeMetadataField,
    objectMetadataItem: activeObjectMetadataItem,
  });

  const handleSave = async () => {
    if (!validatedFormValues) return;

    const formValues = formConfig.getValues();
    const { dirtyFields } = formConfig.formState;

    try {
      if (
        validatedFormValues.type === FieldMetadataType.Relation &&
        isNonEmptyString(relationFieldMetadataItem?.id) &&
        hasRelationFormChanged
      ) {
        await editMetadataField({
          icon: validatedFormValues.relation.field.icon,
          id: relationFieldMetadataItem?.id,
          label: validatedFormValues.relation.field.label,
          type: validatedFormValues.type,
        });
      }

      if (
        Object.keys(dirtyFields).length > 0 ||
        hasFieldFormChanged ||
        hasSelectFormChanged ||
        hasMultiSelectFormChanged ||
        hasDefaultValueChanged
      ) {
        await editMetadataField({
          ...formValues,
          id: activeMetadataField.id,
          defaultValue: validatedFormValues.defaultValue,
          type: validatedFormValues.type,
          options:
            validatedFormValues.type === FieldMetadataType.Select
              ? validatedFormValues.select
              : validatedFormValues.type === FieldMetadataType.MultiSelect
                ? validatedFormValues.multiSelect
                : undefined,
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
              onChange={handleFormChange}
              value={formValues.type}
            />
            <SettingsDataModelFieldSettingsFormCard
              disableCurrencyForm
              fieldMetadataItem={{
                icon: formConfig.watch('icon'),
                id: activeMetadataField.id,
                label: formConfig.watch('label'),
                name: activeMetadataField.name,
                type: formValues.type,
              }}
              objectMetadataItem={activeObjectMetadataItem}
              onChange={handleFormChange}
              relationFieldMetadataItem={relationFieldMetadataItem}
              values={{
                currency: formValues.currency,
                relation: formValues.relation,
                select: formValues.select,
                multiSelect: formValues.multiSelect,
                defaultValue: formValues.defaultValue,
              }}
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
