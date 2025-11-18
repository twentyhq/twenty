import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsDataModelNewFieldBreadcrumbDropDown } from '@/settings/data-model/components/SettingsDataModelNewFieldBreadcrumbDropDown';
import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { SettingsObjectNewFieldSelector } from '@/settings/data-model/fields/forms/components/SettingsObjectNewFieldSelector';
import { type FieldType } from '@/settings/data-model/types/FieldType';
import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
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
      FieldMetadataType.RICH_TEXT,
      FieldMetadataType.RICH_TEXT_V2,
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
    <FormProvider // eslint-disable-next-line react/jsx-props-no-spreading
      {...formMethods}
    >
      <SubMenuTopBarContainer
        title={t`1. Select a field type`}
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          { children: t`Objects`, href: getSettingsPath(SettingsPath.Objects) },
          {
            children: activeObjectMetadataItem.labelPlural,
            href: getSettingsPath(SettingsPath.ObjectDetail, {
              objectNamePlural,
            }),
          },
          { children: <SettingsDataModelNewFieldBreadcrumbDropDown /> },
        ]}
      >
        <SettingsPageContainer>
          <SettingsObjectNewFieldSelector
            objectNamePlural={objectNamePlural}
            excludedFieldTypes={excludedFieldTypes}
          />
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
