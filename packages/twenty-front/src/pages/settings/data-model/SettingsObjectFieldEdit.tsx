import { zodResolver } from '@hookform/resolvers/zod';
import omit from 'lodash.omit';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { type z } from 'zod';

import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { useUpdateOneFieldMetadataItem } from '@/object-metadata/hooks/useUpdateOneFieldMetadataItem';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { formatFieldMetadataItemInput } from '@/object-metadata/utils/formatFieldMetadataItemInput';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { FIELD_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/FieldNameMaximumLength';
import { SettingsDataModelFieldDescriptionForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldDescriptionForm';
import { SettingsDataModelFieldIconLabelForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIconLabelForm';
import { SettingsDataModelFieldSettingsFormCard } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { settingsFieldFormSchema } from '@/settings/data-model/fields/forms/validation-schemas/settingsFieldFormSchema';
import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { shouldNavigateBackToMemorizedUrlOnSaveState } from '@/ui/navigation/states/shouldNavigateBackToMemorizedUrlOnSaveState';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconArchive,
  IconArchiveOff,
  IconTrash,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getFieldMetadataItemInitialValues } from '~/pages/settings/data-model/utils/getFieldMetadataItemInitialValues';

//TODO: fix this type
export type SettingsDataModelFieldEditFormValues = z.infer<
  ReturnType<typeof settingsFieldFormSchema>
> &
  any;

const DELETE_FIELD_MODAL_ID = 'delete-field-confirmation-modal';
const StyledDangerButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsObjectFieldEdit = () => {
  const navigateSettings = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { t } = useLingui();

  const { openModal, closeModal } = useModal();
  const { enqueueSuccessSnackBar } = useSnackBar();

  const navigate = useNavigate();

  const [navigationMemorizedUrl, setNavigationMemorizedUrl] = useRecoilState(
    navigationMemorizedUrlState,
  );

  const [
    shouldNavigateBackToMemorizedUrlOnSave,
    setShouldNavigateBackToMemorizedUrlOnSave,
  ] = useRecoilState(shouldNavigateBackToMemorizedUrlOnSaveState);

  const { objectNamePlural = '', fieldName = '' } = useParams();

  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  const readonly = isObjectMetadataReadOnly({
    objectMetadataItem,
  });

  const {
    deactivateMetadataField,
    activateMetadataField,
    deleteMetadataField,
  } = useFieldMetadataItem();

  const [newNameDuringSave, setNewNameDuringSave] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const fieldMetadataItem = objectMetadataItem?.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.name === fieldName ||
      fieldMetadataItem.name === newNameDuringSave,
  );

  const getRelationMetadata = useGetRelationMetadata();
  const { updateOneFieldMetadataItem } = useUpdateOneFieldMetadataItem();

  const { settings, defaultValue } =
    getFieldMetadataItemInitialValues(fieldMetadataItem);

  const formConfig = useForm<SettingsDataModelFieldEditFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsFieldFormSchema()),
    values: {
      icon: fieldMetadataItem?.icon ?? 'Icon',
      type: fieldMetadataItem?.type as SettingsFieldType,
      label: fieldMetadataItem?.label ?? '',
      description: fieldMetadataItem?.description,
      isLabelSyncedWithName: fieldMetadataItem?.isLabelSyncedWithName ?? true,
      settings,
      defaultValue,
    },
  });

  useEffect(() => {
    if (!isDeleting && (!objectMetadataItem || !fieldMetadataItem)) {
      navigateApp(AppPath.NotFound);
    }
  }, [navigateApp, objectMetadataItem, fieldMetadataItem, isDeleting]);

  const { isDirty, isValid, isSubmitting } = formConfig.formState;

  const canSave = isDirty && isValid && !isSubmitting;

  if (!isDefined(objectMetadataItem) || !isDefined(fieldMetadataItem)) {
    return null;
  }

  const fieldLabel = fieldMetadataItem.label;
  const objectLabel = objectMetadataItem.labelPlural;

  const isLabelIdentifier = isLabelIdentifierField({
    fieldMetadataItem: fieldMetadataItem,
    objectMetadataItem: objectMetadataItem,
  });

  const fieldNamesThatCannotBeDeactivated = [
    'createdAt',
    'createdBy',
    'deletedAt',
    'updatedAt',
  ];

  const fieldCanBeDeactivated = !fieldNamesThatCannotBeDeactivated.includes(
    fieldMetadataItem.name,
  );

  const handleSave = async (
    formValues: SettingsDataModelFieldEditFormValues,
  ) => {
    if (readonly) {
      return;
    }

    const { dirtyFields } = formConfig.formState;
    setNewNameDuringSave(formValues.name);

    if (
      formValues.type === FieldMetadataType.RELATION &&
      'relation' in formValues &&
      'relation' in dirtyFields
    ) {
      const { relationFieldMetadataItem } =
        getRelationMetadata({
          fieldMetadataItem: fieldMetadataItem,
        }) ?? {};

      if (isDefined(relationFieldMetadataItem)) {
        const result = await updateOneFieldMetadataItem({
          objectMetadataId: objectMetadataItem.id,
          fieldMetadataIdToUpdate: relationFieldMetadataItem.id,
          updatePayload: formValues.relation.field,
        });

        if (result.status === 'failed') {
          return;
        }
      }
    }

    const otherDirtyFields = omit(dirtyFields, 'relation');

    if (Object.keys(otherDirtyFields).length > 0) {
      const formattedInput = Object.fromEntries(
        Object.entries(formatFieldMetadataItemInput(formValues)).filter(
          ([key]) => Object.keys(otherDirtyFields).includes(key),
        ),
      );

      const updateResult = await updateOneFieldMetadataItem({
        objectMetadataId: objectMetadataItem.id,
        fieldMetadataIdToUpdate: fieldMetadataItem.id,
        updatePayload: formattedInput,
      });

      if (updateResult.status === 'successful') {
        navigateBackOrToSettings();
      }
    }
  };

  const navigateBackOrToSettings = () => {
    if (
      shouldNavigateBackToMemorizedUrlOnSave &&
      isDefined(navigationMemorizedUrl)
    ) {
      navigate(navigationMemorizedUrl, { replace: true });

      setShouldNavigateBackToMemorizedUrlOnSave(false);
      setNavigationMemorizedUrl('/');

      return;
    }

    navigateSettings(SettingsPath.ObjectDetail, {
      objectNamePlural,
    });
  };

  const handleCancel = () => {
    navigateBackOrToSettings();
  };

  const handleDeactivate = async () => {
    if (readonly) {
      return;
    }

    const deactivationResult = await deactivateMetadataField(
      fieldMetadataItem.id,
      objectMetadataItem.id,
    );
    if (deactivationResult.status === 'successful') {
      navigateSettings(SettingsPath.ObjectDetail, {
        objectNamePlural,
      });
    }
  };

  const handleActivate = async () => {
    if (readonly) {
      return;
    }

    const activationResult = await activateMetadataField(
      fieldMetadataItem.id,
      objectMetadataItem.id,
    );

    if (activationResult.status === 'successful') {
      navigateSettings(SettingsPath.ObjectDetail, {
        objectNamePlural,
      });
    }
  };

  const handleDelete = () => {
    if (readonly || !fieldMetadataItem?.isCustom) {
      return;
    }

    openModal(DELETE_FIELD_MODAL_ID);
  };

  const confirmDelete = async () => {
    if (!isDefined(objectMetadataItem) || !isDefined(fieldMetadataItem)) {
      return;
    }

    setIsDeleting(true);

    const deleteResult = await deleteMetadataField({
      idToDelete: fieldMetadataItem.id,
      objectMetadataId: objectMetadataItem.id,
    });

    if (deleteResult.status === 'successful') {
      enqueueSuccessSnackBar({
        message: t`Field deleted`,
      });
      closeModal(DELETE_FIELD_MODAL_ID);
      navigateSettings(SettingsPath.ObjectDetail, {
        objectNamePlural,
      });
      return;
    }

    setIsDeleting(false);
    closeModal(DELETE_FIELD_MODAL_ID);
  };

  return (
    <>
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
              isLoading={isSubmitting}
              isSaveDisabled={!canSave || readonly}
              isCancelDisabled={isSubmitting || readonly}
              onCancel={handleCancel}
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
                fieldMetadataItem={fieldMetadataItem}
                maxLength={FIELD_NAME_MAXIMUM_LENGTH}
                isCreationMode={false}
                readonly={readonly}
              />
            </Section>
            {
              //patch - awaiting refacto on many to many relations - https://github.com/twentyhq/core-team-issues/issues/186
              fieldMetadataItem.name !== CoreObjectNamePlural.NoteTarget &&
                fieldMetadataItem.name !== CoreObjectNamePlural.TaskTarget && (
                  <>
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
                        fieldType={fieldMetadataItem.type}
                        existingFieldMetadataId={fieldMetadataItem.id}
                        objectNameSingular={objectMetadataItem.nameSingular}
                        disabled={readonly}
                      />
                    </Section>
                  </>
                )
            }
            <Section>
              <H2Title
                title={t`Description`}
                description={t`The description of this field`}
              />
              <SettingsDataModelFieldDescriptionForm
                fieldMetadataItem={fieldMetadataItem}
                disabled={readonly}
              />
            </Section>

            {!isLabelIdentifier && !readonly && fieldCanBeDeactivated && (
              <Section>
                <H2Title
                  title={t`Danger zone`}
                  description={t`Deactivate this field`}
                />
                <StyledDangerButtons>
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
                  {fieldMetadataItem.isCustom && (
                    <Button
                      Icon={IconTrash}
                      variant="secondary"
                      accent="danger"
                      title={t`Delete`}
                      size="small"
                      onClick={handleDelete}
                    />
                  )}
                </StyledDangerButtons>
              </Section>
            )}
          </SettingsPageContainer>
        </SubMenuTopBarContainer>
      </FormProvider>
      {fieldMetadataItem?.isCustom && (
        <ConfirmationModal
          modalId={DELETE_FIELD_MODAL_ID}
          title={t`Delete ${fieldLabel} field?`}
          subtitle={t`This will permanently delete the field and all its data from ${objectLabel}. Type "yes" to confirm.`}
          confirmButtonText={t`Delete`}
          confirmationValue="yes"
          confirmationPlaceholder="yes"
          onConfirmClick={confirmDelete}
          onClose={() => closeModal(DELETE_FIELD_MODAL_ID)}
          loading={isDeleting}
        />
      )}
    </>
  );
};
