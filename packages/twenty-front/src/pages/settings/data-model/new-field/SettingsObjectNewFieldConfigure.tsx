import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsDataModelNewFieldBreadcrumbDropDown } from '@/settings/data-model/components/SettingsDataModelNewFieldBreadcrumbDropDown';
import { FIELD_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/FieldNameMaximumLength';
import { SettingsDataModelFieldIconLabelForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIconLabelForm';
import { SettingsDataModelFieldSettingsFormCard } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { settingsFieldFormSchema } from '@/settings/data-model/fields/forms/validation-schemas/settingsFieldFormSchema';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  AppPath,
  type RelationCreationPayload,
  SettingsPath,
} from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { type z } from 'zod';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { DEFAULT_ICONS_BY_FIELD_TYPE } from '~/pages/settings/data-model/constants/DefaultIconsByFieldType';

type SettingsDataModelNewFieldFormValues = z.infer<
  ReturnType<typeof settingsFieldFormSchema>
> &
  any;

const DEFAULT_ICON_FOR_NEW_FIELD = 'IconUsers';

export const SettingsObjectNewFieldConfigure = () => {
  const { t } = useLingui();

  const navigateApp = useNavigateApp();
  const navigate = useNavigateSettings();

  const { objectNamePlural = '' } = useParams();
  const [searchParams] = useSearchParams();
  const fieldType =
    (searchParams.get('fieldType') as FieldMetadataType) ||
    FieldMetadataType.TEXT;
  const { enqueueErrorSnackBar } = useSnackBar();

  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const activeObjectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);
  const { createMetadataField } = useFieldMetadataItem();

  const formConfig = useForm<SettingsDataModelNewFieldFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(
      settingsFieldFormSchema(
        activeObjectMetadataItem?.fields.map((value) => value.name),
      ),
    ),
    defaultValues: {
      type: fieldType,
      icon:
        DEFAULT_ICONS_BY_FIELD_TYPE[fieldType] ?? DEFAULT_ICON_FOR_NEW_FIELD,
      label: '',
      name: '',
    },
  });

  useEffect(() => {
    formConfig.setValue(
      'icon',
      DEFAULT_ICONS_BY_FIELD_TYPE[fieldType] ?? DEFAULT_ICON_FOR_NEW_FIELD,
    );
  }, [fieldType, formConfig]);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!activeObjectMetadataItem) {
      navigateApp(AppPath.NotFound);
    }
  }, [activeObjectMetadataItem, navigateApp]);

  if (!activeObjectMetadataItem) return null;

  const { isValid, isSubmitting } = formConfig.formState;

  const canSave = isValid && !isSubmitting;

  const handleSave = async (
    formValues: SettingsDataModelNewFieldFormValues,
  ) => {
    setIsSaving(true);

    const createCleanUp = (
      creationResult: Awaited<ReturnType<typeof createMetadataField>>,
    ) => {
      if (creationResult.status === 'successful') {
        navigate(SettingsPath.ObjectDetail, {
          objectNamePlural,
        });
      }
      setIsSaving(false);
    };

    if (formValues.type !== FieldMetadataType.MORPH_RELATION) {
      const creationResult = await createMetadataField({
        ...formValues,
        objectMetadataId: activeObjectMetadataItem.id,
      });

      return createCleanUp(creationResult);
    }

    const {
      morphRelationObjectMetadataIds,
      targetFieldLabel,
      iconOnDestination,
      relationType,
    } = formValues;

    switch (true) {
      case morphRelationObjectMetadataIds.length > 1: {
        const creationResult = await createMetadataField({
          ...formValues,
          type: FieldMetadataType.MORPH_RELATION,
          objectMetadataId: activeObjectMetadataItem.id,
          isLabelSyncedWithName: false,
          morphRelationsCreationPayload: morphRelationObjectMetadataIds.map(
            (morphRelationObjectMetadataId: string) => ({
              type: relationType,
              targetObjectMetadataId: morphRelationObjectMetadataId,
              targetFieldLabel,
              targetFieldIcon: iconOnDestination,
            }),
          ),
        });
        return createCleanUp(creationResult);
      }
      case morphRelationObjectMetadataIds.length === 1: {
        const relationCreationPayload = {
          type: relationType,
          targetObjectMetadataId: morphRelationObjectMetadataIds[0],
          targetFieldLabel,
          targetFieldIcon: iconOnDestination,
        } satisfies RelationCreationPayload;

        const creationResult = await createMetadataField({
          ...formValues,
          type: FieldMetadataType.RELATION,
          objectMetadataId: activeObjectMetadataItem.id,
          relationCreationPayload,
        });

        return createCleanUp(creationResult);
      }
      default: {
        enqueueErrorSnackBar({
          message: t`Please select at least one destination object for this relation.`,
        });
        return setIsSaving(false);
      }
    }
  };

  if (!activeObjectMetadataItem) return null;

  return (
    <FormProvider // eslint-disable-next-line react/jsx-props-no-spreading
      {...formConfig}
    >
      <SubMenuTopBarContainer
        title={t`2. Configure field`}
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
            children: activeObjectMetadataItem.labelPlural,
            href: getSettingsPath(SettingsPath.ObjectDetail, {
              objectNamePlural,
            }),
          },

          { children: <SettingsDataModelNewFieldBreadcrumbDropDown /> },
        ]}
        actionButton={
          <SaveAndCancelButtons
            isLoading={isSaving}
            isSaveDisabled={!canSave}
            isCancelDisabled={isSubmitting}
            onCancel={() =>
              navigate(
                SettingsPath.ObjectNewFieldSelect,
                {
                  objectNamePlural,
                },
                {
                  fieldType,
                },
              )
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
              maxLength={FIELD_NAME_MAXIMUM_LENGTH}
              isCreationMode={true}
            />
          </Section>
          <Section>
            <H2Title
              title={t`Customization`}
              description={t`Customize field settings`}
            />
            <SettingsDataModelFieldSettingsFormCard
              fieldType={fieldType}
              existingFieldMetadataId=""
              objectNameSingular={activeObjectMetadataItem.nameSingular}
            />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
