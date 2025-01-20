import { zodResolver } from '@hookform/resolvers/zod';
import omit from 'lodash.omit';
import pick from 'lodash.pick';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
  Button,
  H2Title,
  IconArchive,
  IconArchiveOff,
  Section,
} from 'twenty-ui';
import { z } from 'zod';

import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { useUpdateOneFieldMetadataItem } from '@/object-metadata/hooks/useUpdateOneFieldMetadataItem';
import { formatFieldMetadataItemInput } from '@/object-metadata/utils/formatFieldMetadataItemInput';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { FIELD_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/FieldNameMaximumLength';
import { SettingsDataModelFieldDescriptionForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldDescriptionForm';
import { SettingsDataModelFieldIconLabelForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIconLabelForm';
import { SettingsDataModelFieldSettingsFormCard } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { settingsFieldFormSchema } from '@/settings/data-model/fields/forms/validation-schemas/settingsFieldFormSchema';
import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { isDefined } from '~/utils/isDefined';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

//TODO: fix this type
type SettingsDataModelFieldEditFormValues = z.infer<
  ReturnType<typeof settingsFieldFormSchema>
> &
  any;

export const SettingsObjectFieldEdit = () => {
  const navigateSettings = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { t } = useLingui();

  const { enqueueSnackBar } = useSnackBar();

  const { objectNamePlural = '', fieldName = '' } = useParams();
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  const { deactivateMetadataField, activateMetadataField } =
    useFieldMetadataItem();

  const fieldMetadataItem = objectMetadataItem?.fields.find(
    (fieldMetadataItem) => fieldMetadataItem.name === fieldName,
  );

  const getRelationMetadata = useGetRelationMetadata();
  const { updateOneFieldMetadataItem } = useUpdateOneFieldMetadataItem();

  const formConfig = useForm<SettingsDataModelFieldEditFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsFieldFormSchema()),
    values: {
      icon: fieldMetadataItem?.icon ?? 'Icon',
      type: fieldMetadataItem?.type as SettingsFieldType,
      label: fieldMetadataItem?.label ?? '',
      description: fieldMetadataItem?.description,
      isLabelSyncedWithName: fieldMetadataItem?.isLabelSyncedWithName ?? true,
    },
  });

  useEffect(() => {
    if (!objectMetadataItem || !fieldMetadataItem) {
      navigateApp(AppPath.NotFound);
    }
  }, [navigateApp, objectMetadataItem, fieldMetadataItem]);

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
            objectMetadataId: objectMetadataItem.id,
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

        navigateSettings(SettingsPath.ObjectDetail, {
          objectNamePlural,
        });

        await updateOneFieldMetadataItem({
          objectMetadataId: objectMetadataItem.id,
          fieldMetadataIdToUpdate: fieldMetadataItem.id,
          updatePayload: formattedInput,
        });
      }
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const handleDeactivate = async () => {
    await deactivateMetadataField(fieldMetadataItem.id, objectMetadataItem.id);
    navigateSettings(SettingsPath.ObjectDetail, {
      objectNamePlural,
    });
  };

  const handleActivate = async () => {
    await activateMetadataField(fieldMetadataItem.id, objectMetadataItem.id);
    navigateSettings(SettingsPath.ObjectDetail, {
      objectNamePlural,
    });
  };

  return (
    <RecordFieldValueSelectorContextProvider>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <FormProvider {...formConfig}>
        <SubMenuTopBarContainer
          title={fieldMetadataItem?.label}
          links={[
            {
              children: t`Workspace`,
              href: getSettingsPath(SettingsPath.Workspace),
            },
            {
              children: t`Objects`,
              href: getSettingsPath(SettingsPath.Objects),
            },
            {
              children: objectMetadataItem.labelPlural,
              href: getSettingsPath(SettingsPath.ObjectDetail, {
                objectNamePlural,
              }),
            },
            {
              children: fieldMetadataItem.label,
            },
          ]}
          actionButton={
            <SaveAndCancelButtons
              isSaveDisabled={!canSave}
              isCancelDisabled={isSubmitting}
              onCancel={() =>
                navigateSettings(SettingsPath.ObjectDetail, {
                  objectNamePlural,
                })
              }
              onSave={formConfig.handleSubmit(handleSave)}
            />
          }
        >
          <SettingsPageContainer>
            <Section>
              <H2Title
                title={t`Icon and Name`}
                description={t`The name and icon of this field`}
              />
              <SettingsDataModelFieldIconLabelForm
                disabled={!fieldMetadataItem.isCustom}
                fieldMetadataItem={fieldMetadataItem}
                maxLength={FIELD_NAME_MAXIMUM_LENGTH}
                canToggleSyncLabelWithName={
                  fieldMetadataItem.type !== FieldMetadataType.Relation
                }
              />
            </Section>
            <Section>
              {fieldMetadataItem.isUnique ? (
                <H2Title
                  title={t`Values`}
                  description={t`The values of this field must be unique`}
                />
              ) : (
                <H2Title
                  title={t`Values`}
                  description={t`The values of this field`}
                />
              )}
              <SettingsDataModelFieldSettingsFormCard
                fieldMetadataItem={fieldMetadataItem}
                objectMetadataItem={objectMetadataItem}
              />
            </Section>
            <Section>
              <H2Title
                title={t`Description`}
                description={t`The description of this field`}
              />
              <SettingsDataModelFieldDescriptionForm
                disabled={!fieldMetadataItem.isCustom}
                fieldMetadataItem={fieldMetadataItem}
              />
            </Section>
            {!isLabelIdentifier && (
              <Section>
                <H2Title
                  title={t`Danger zone`}
                  description={t`Deactivate this field`}
                />
                <Button
                  Icon={
                    fieldMetadataItem.isActive ? IconArchive : IconArchiveOff
                  }
                  variant="secondary"
                  title={
                    fieldMetadataItem.isActive ? t`Deactivate` : t`Activate`
                  }
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
