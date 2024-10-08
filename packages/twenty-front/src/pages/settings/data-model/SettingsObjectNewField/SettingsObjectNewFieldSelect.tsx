import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsDataModelNewFieldBreadcrumbDropDown } from '@/settings/data-model/components/SettingsDataModelNewFieldBreadcrumbDropDown';
import {
  settingsDataModelFieldTypeFormSchema,
  SettingsObjectNewFieldSelector,
} from '@/settings/data-model/fields/forms/components/SettingsObjectNewFieldSelector';
import { SettingsSupportedFieldType } from '@/settings/data-model/types/SettingsSupportedFieldType';
import { AppPath } from '@/types/AppPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { isDefined } from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const SettingsObjectNewFieldSelect = () => {
  const navigate = useNavigate();
  const { objectSlug = '' } = useParams();
  const { findActiveObjectMetadataItemBySlug } =
    useFilteredObjectMetadataItems();
  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);
  const formMethods = useForm({
    resolver: zodResolver(settingsDataModelFieldTypeFormSchema),
    defaultValues: {
      type: FieldMetadataType.Text,
    },
  });
  const excludedFieldTypes: SettingsSupportedFieldType[] = (
    [
      FieldMetadataType.Link,
      FieldMetadataType.Numeric,
      FieldMetadataType.RichText,
      FieldMetadataType.Actor,
      FieldMetadataType.Email,
      FieldMetadataType.Phone,
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
              href: `/settings/objects/${objectSlug}`,
            },
            { children: <SettingsDataModelNewFieldBreadcrumbDropDown /> },
          ]}
        >
          <SettingsPageContainer>
            <SettingsObjectNewFieldSelector
              objectSlug={objectSlug}
              excludedFieldTypes={excludedFieldTypes}
            />
          </SettingsPageContainer>
        </SubMenuTopBarContainer>
      </FormProvider>
    </RecordFieldValueSelectorContextProvider>
  );
};
