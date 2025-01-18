import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsDataModelNewFieldBreadcrumbDropDown } from '@/settings/data-model/components/SettingsDataModelNewFieldBreadcrumbDropDown';
import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { SettingsObjectNewFieldSelector } from '@/settings/data-model/fields/forms/components/SettingsObjectNewFieldSelector';
import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-ui';
import { z } from 'zod';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

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
  const { findActiveObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const activeObjectMetadataItem =
    findActiveObjectMetadataItemByNamePlural(objectNamePlural);
  const formMethods = useForm({
    resolver: zodResolver(settingsDataModelFieldTypeFormSchema),
    defaultValues: {
      type: FieldMetadataType.Text,
    },
  });
  const excludedFieldTypes: SettingsFieldType[] = (
    [
      FieldMetadataType.Numeric,
      FieldMetadataType.RichText,
      FieldMetadataType.Actor,
    ] as const
  ).filter(isDefined);

  useEffect(() => {
    if (!activeObjectMetadataItem) {
      navigate(AppPath.NotFound);
    }
  }, [activeObjectMetadataItem, navigate]);

  if (!activeObjectMetadataItem) return null;

  return (
    <RecordFieldValueSelectorContextProvider>
      <FormProvider // eslint-disable-next-line react/jsx-props-no-spreading
        {...formMethods}
      >
        <SubMenuTopBarContainer
          title="1. Select a field type"
          links={[
            { children: 'Workspace', href: '/settings/workspace' },
            { children: 'Objects', href: '/settings/objects' },
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
    </RecordFieldValueSelectorContextProvider>
  );
};
