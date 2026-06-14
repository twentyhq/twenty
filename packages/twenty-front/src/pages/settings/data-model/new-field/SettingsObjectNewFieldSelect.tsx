import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsWizardStepBar } from '@/settings/components/layout/SettingsWizardStepBar';
import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { SettingsObjectNewFieldHeaderIcon } from '@/settings/data-model/fields/components/SettingsObjectNewFieldHeaderIcon';
import { SettingsObjectNewFieldSelector } from '@/settings/data-model/fields/forms/components/SettingsObjectNewFieldSelector';
import { type FieldType } from '@/settings/data-model/types/FieldType';
import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { z } from 'zod';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const settingsDataModelFieldTypeFormSchema = z.object({
  type: z.enum(
    Object.keys(SETTINGS_FIELD_TYPE_CONFIGS) as [
      SettingsFieldType,
      ...SettingsFieldType[],
    ],
  ),
});

export type SettingsDataModelFieldTypeFormValues = z.infer<
  typeof settingsDataModelFieldTypeFormSchema
>;

export const SettingsObjectNewFieldSelect = () => {
  const navigate = useNavigateApp();
  const { objectNamePlural = '' } = useParams();
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const activeObjectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);
  const formMethods = useForm({
    resolver: zodResolver(settingsDataModelFieldTypeFormSchema),
    defaultValues: {
      type: FieldMetadataType.TEXT,
    },
  });

  const excludedFieldTypes: FieldType[] = (
    [
      FieldMetadataType.NUMERIC,
      FieldMetadataType.ACTOR,
      FieldMetadataType.UUID,
    ] as const
  ).filter(isDefined);

  useEffect(() => {
    if (!activeObjectMetadataItem) {
      navigate(AppPath.NotFound);
    }
  }, [activeObjectMetadataItem, navigate]);

  if (!activeObjectMetadataItem) return null;

  return (
    <FormProvider // oxlint-disable-next-line react/jsx-props-no-spreading
      {...formMethods}
    >
      <SettingsPageLayout
        title={activeObjectMetadataItem.labelPlural}
        icon={
          <SettingsObjectNewFieldHeaderIcon
            objectMetadataItem={activeObjectMetadataItem}
          />
        }
        titleColor={themeCssVariables.font.color.tertiary}
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.General),
          },
          { children: t`Objects`, href: getSettingsPath(SettingsPath.Objects) },
          {
            children: activeObjectMetadataItem.labelPlural,
            href: getSettingsPath(SettingsPath.ObjectDetail, {
              objectNamePlural,
            }),
          },
          { children: t`New field` },
        ]}
        secondaryBar={
          <SettingsWizardStepBar label={t`1. Select a field type`} />
        }
      >
        <SettingsPageContainer>
          <SettingsObjectNewFieldSelector
            objectNamePlural={objectNamePlural}
            excludedFieldTypes={excludedFieldTypes}
          />
        </SettingsPageContainer>
      </SettingsPageLayout>
    </FormProvider>
  );
};
