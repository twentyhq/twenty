import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsDataModelNewFieldBreadcrumbDropDown } from '@/settings/data-model/components/SettingsDataModelNewFieldBreadcrumbDropDown';
import { FIELD_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/FieldNameMaximumLength';
import { SettingsDataModelFieldDescriptionForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldDescriptionForm';
import { SettingsDataModelFieldIconLabelForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIconLabelForm';
import { SettingsDataModelFieldSettingsFormCard } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { settingsFieldFormSchema } from '@/settings/data-model/fields/forms/validation-schemas/settingsFieldFormSchema';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { type View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';
import { ApolloError } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams, useSearchParams } from 'react-router-dom';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { type z } from 'zod';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { DEFAULT_ICONS_BY_FIELD_TYPE } from '~/pages/settings/data-model/constants/DefaultIconsByFieldType';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

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

  const { findActiveObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const activeObjectMetadataItem =
    findActiveObjectMetadataItemByNamePlural(objectNamePlural);
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
      description: '',
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

  useFindManyRecords<View>({
    objectNameSingular: CoreObjectNameSingular.View,
    filter: {
      type: { eq: ViewType.Table },
      objectMetadataId: { eq: activeObjectMetadataItem?.id },
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
  });

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
    try {
      setIsSaving(true);
      if (
        formValues.type === FieldMetadataType.RELATION &&
        'relation' in formValues
      ) {
        const { relation: relationFormValues, ...fieldFormValues } = formValues;
        await createMetadataField({
          ...fieldFormValues,
          objectMetadataId: activeObjectMetadataItem.id,
          relationCreationPayload: {
            type: relationFormValues.type,
            targetObjectMetadataId: relationFormValues.objectMetadataId,
            targetFieldLabel: relationFormValues.field.label,
            targetFieldIcon: relationFormValues.field.icon,
          },
        });
      } else if (
        formValues.type === FieldMetadataType.MORPH_RELATION &&
        'morphRelationObjectMetadataIds' in formValues
      ) {
        const {
          morphRelationObjectMetadataIds,
          targetFieldLabel,
          iconOnDestination,
          relationType,
        } = formValues;
        await createMetadataField({
          ...formValues,
          objectMetadataId: activeObjectMetadataItem.id,
          morphRelationsCreationPayload: morphRelationObjectMetadataIds.map(
            (morphRelationObjectMetadataId: string) => ({
              type: relationType,
              targetObjectMetadataId: morphRelationObjectMetadataId,
              targetFieldLabel,
              targetFieldIcon: iconOnDestination,
            }),
          ),
        });
      } else {
        await createMetadataField({
          ...formValues,
          objectMetadataId: activeObjectMetadataItem.id,
        });
      }

      navigate(SettingsPath.ObjectDetail, {
        objectNamePlural,
      });

      setIsSaving(false);
    } catch (error) {
      setIsSaving(false);
      enqueueErrorSnackBar({
        apolloError: error instanceof ApolloError ? error : undefined,
      });
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
          <Section>
            <H2Title
              title={t`Description`}
              description={t`The description of this field`}
            />
            <SettingsDataModelFieldDescriptionForm />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
