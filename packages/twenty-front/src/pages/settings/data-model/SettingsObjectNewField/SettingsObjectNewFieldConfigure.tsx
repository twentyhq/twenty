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
import { settingsFieldFormSchema } from '@/settings/data-model/fields/forms/validation-schemas/settingsFieldFormSchema';
import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';
import { useApolloClient } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import pick from 'lodash.pick';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams, useSearchParams } from 'react-router-dom';
import { H2Title, Section } from 'twenty-ui';
import { z } from 'zod';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { DEFAULT_ICONS_BY_FIELD_TYPE } from '~/pages/settings/data-model/constants/DefaultIconsByFieldType';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
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
    (searchParams.get('fieldType') as SettingsFieldType) ||
    FieldMetadataType.Text;
  const { enqueueSnackBar } = useSnackBar();

  const { findActiveObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const activeObjectMetadataItem =
    findActiveObjectMetadataItemByNamePlural(objectNamePlural);
  const { createMetadataField } = useFieldMetadataItem();
  const apolloClient = useApolloClient();

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
      if (
        formValues.type === FieldMetadataType.Relation &&
        'relation' in formValues
      ) {
        const { relation: relationFormValues, ...fieldFormValues } = formValues;

        await createOneRelationMetadata({
          relationType: relationFormValues.type,
          field: pick(fieldFormValues, [
            'icon',
            'label',
            'description',
            'name',
            'isLabelSyncedWithName',
          ]),
          objectMetadataId: activeObjectMetadataItem.id,
          connect: {
            field: {
              icon: relationFormValues.field.icon,
              label: relationFormValues.field.label,
              name:
                (relationFormValues.field.isLabelSyncedWithName ?? true)
                  ? computeMetadataNameFromLabel(relationFormValues.field.label)
                  : relationFormValues.field.name,
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

      navigate(SettingsPath.ObjectDetail, {
        objectNamePlural,
      });

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
  if (!activeObjectMetadataItem) return null;

  return (
    <RecordFieldValueSelectorContextProvider>
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
                canToggleSyncLabelWithName={
                  fieldType !== FieldMetadataType.Relation
                }
              />
            </Section>
            <Section>
              <H2Title
                title={t`Values`}
                description={t`The values of this field`}
              />
              <SettingsDataModelFieldSettingsFormCard
                fieldMetadataItem={{
                  icon: formConfig.watch('icon'),
                  label: formConfig.watch('label') || 'New Field',
                  settings: formConfig.watch('settings') || null,
                  type: fieldType as FieldMetadataType,
                }}
                objectMetadataItem={activeObjectMetadataItem}
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
    </RecordFieldValueSelectorContextProvider>
  );
};
