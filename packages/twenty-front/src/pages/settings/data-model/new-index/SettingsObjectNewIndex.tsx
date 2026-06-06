import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useCreateOneIndexMetadataItem } from '@/object-metadata/hooks/useCreateOneIndexMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SEARCH_VECTOR_FIELD_NAME } from '@/object-record/constants/SearchVectorFieldName';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectIndexFieldsForm } from '@/settings/data-model/indexes/forms/components/SettingsObjectIndexFieldsForm';
import { SettingsObjectIndexOptionsForm } from '@/settings/data-model/indexes/forms/components/SettingsObjectIndexOptionsForm';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { AppPath, RelationType, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Callout, H2Title, IconAlertTriangle } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { IndexType } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { MAX_CUSTOM_INDEXES_PER_OBJECT } from 'twenty-shared/constants';
import {
  settingsObjectNewIndexFormSchema,
  type SettingsObjectNewIndexFormValues,
} from '~/pages/settings/data-model/new-index/SettingsObjectNewIndexFormValues';

const isFieldIndexable = (field: FieldMetadataItem): boolean => {
  if (field.name === SEARCH_VECTOR_FIELD_NAME) return false;
  if (field.isSystem === true) return false;
  if (field.isActive !== true) return false;

  // Only MANY_TO_ONE relations have a join column on this side; ONE_TO_MANY
  // and MANY_TO_MANY have nothing concrete to index.
  const relationType =
    field.relation?.type ?? field.morphRelations?.[0]?.type ?? null;

  if (isDefined(relationType) && relationType !== RelationType.MANY_TO_ONE) {
    return false;
  }

  return true;
};

export const SettingsObjectNewIndex = () => {
  const { t } = useLingui();
  const navigateApp = useNavigateApp();
  const navigate = useNavigateSettings();
  const { objectNamePlural = '' } = useParams();
  const { enqueueSuccessSnackBar } = useSnackBar();

  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const activeObjectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  const { createOneIndexMetadataItem } = useCreateOneIndexMetadataItem();

  const formConfig = useForm<SettingsObjectNewIndexFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsObjectNewIndexFormSchema),
    defaultValues: {
      fields: [],
      indexType: IndexType.BTREE,
    },
  });

  useEffect(() => {
    if (!isDefined(activeObjectMetadataItem)) {
      navigateApp(AppPath.NotFound);
    }
  }, [activeObjectMetadataItem, navigateApp]);

  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  const indexableFields = useMemo(
    () =>
      (activeObjectMetadataItem?.fields ?? [])
        .filter(isFieldIndexable)
        .sort((a, b) => a.label.localeCompare(b.label)),
    [activeObjectMetadataItem?.fields],
  );

  if (!isDefined(activeObjectMetadataItem)) return null;

  const customIndexCount = activeObjectMetadataItem.indexMetadatas.filter(
    (indexMetadata) => indexMetadata.isCustom,
  ).length;
  const reachedCap = customIndexCount >= MAX_CUSTOM_INDEXES_PER_OBJECT;

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting && !isDDLLocked && !reachedCap;

  const handleSave = async (formValues: SettingsObjectNewIndexFormValues) => {
    const result = await createOneIndexMetadataItem({
      objectMetadataId: activeObjectMetadataItem.id,
      fields: formValues.fields.map((entry) => ({
        fieldMetadataId: entry.fieldMetadataId,
        subFieldName: entry.subFieldName,
      })),
      indexType: formValues.indexType,
    });

    if (result.status === 'successful') {
      enqueueSuccessSnackBar({ message: t`Index created` });
      navigate(SettingsPath.ObjectDetail, { objectNamePlural });
    }
  };

  return (
    <FormProvider // oxlint-disable-next-line react/jsx-props-no-spreading
      {...formConfig}
    >
      <SettingsPageLayout
        title={t`New Index`}
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.General),
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
          { children: t`New Index` },
        ]}
        actionButton={
          <SaveAndCancelButtons
            isLoading={isSubmitting}
            isSaveDisabled={!canSave}
            isCancelDisabled={isSubmitting}
            onCancel={() =>
              navigate(SettingsPath.ObjectDetail, { objectNamePlural })
            }
            onSave={formConfig.handleSubmit(handleSave)}
          />
        }
      >
        <SettingsPageContainer>
          <Section>
            <Callout
              variant="warning"
              Icon={IconAlertTriangle}
              title={t`Use indexes sparingly`}
              description={t`Each index speeds up reads on the fields it covers, but slows down every insert and update, and uses disk space. Only add an index when you know which queries it serves.`}
            />
          </Section>
          <Section>
            <H2Title
              title={t`Fields`}
              description={t`Pick one or more fields. The order you select them in becomes the column order in the index — important for composite queries. For composite fields like Address, pick the specific sub-column to index.`}
            />
            <SettingsObjectIndexFieldsForm indexableFields={indexableFields} />
          </Section>
          <Section>
            <H2Title
              title={t`Options`}
              description={t`Pick the index type. BTREE covers most queries; GIN is for full-text and JSONB.`}
            />
            <SettingsObjectIndexOptionsForm />
          </Section>
        </SettingsPageContainer>
      </SettingsPageLayout>
    </FormProvider>
  );
};
