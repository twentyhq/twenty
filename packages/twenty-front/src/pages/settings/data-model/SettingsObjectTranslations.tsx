import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsMetadataTranslationsSection } from '@/settings/translations/components/SettingsMetadataTranslationsSection';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

export const SettingsObjectTranslations = () => {
  const { t } = useLingui();
  const { objectNamePlural = '', fieldName } = useParams();

  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);
  const fieldMetadataItem = objectMetadataItem?.fields.find(
    (fieldMetadataItem) => fieldMetadataItem.name === fieldName,
  );

  if (
    !isDefined(objectMetadataItem) ||
    (isDefined(fieldName) && !isDefined(fieldMetadataItem))
  ) {
    return null;
  }

  return (
    <SettingsPageLayout
      title={t`Translations`}
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
          children: objectMetadataItem.labelPlural,
          href: getSettingsPath(SettingsPath.ObjectDetail, {
            objectNamePlural,
          }),
        },
        ...(isDefined(fieldMetadataItem)
          ? [
              {
                children: fieldMetadataItem.label,
                href: getSettingsPath(SettingsPath.ObjectFieldEdit, {
                  objectNamePlural,
                  fieldName: fieldMetadataItem.name,
                }),
              },
            ]
          : []),
        { children: t`Translations` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsMetadataTranslationsSection
          input={
            isDefined(fieldMetadataItem)
              ? { fieldMetadataId: fieldMetadataItem.id }
              : { objectMetadataId: objectMetadataItem.id }
          }
        />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
