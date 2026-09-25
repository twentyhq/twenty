import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsMetadataTranslationsSection } from '@/settings/translations/components/SettingsMetadataTranslationsSection';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const SettingsObjectTranslations = () => {
  const { t } = useLingui();
  const navigateApp = useNavigateApp();
  const workspaceSurface = useWorkspaceSurface();
  const { objectNamePlural = '', fieldName } = useParams();

  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);
  const fieldMetadataItem = isDefined(fieldName)
    ? objectMetadataItem?.fields.find(
        (fieldMetadataItem) => fieldMetadataItem.name === fieldName,
      )
    : undefined;
  const isMetadataItemMissing =
    !isDefined(objectMetadataItem) ||
    (isDefined(fieldName) && !isDefined(fieldMetadataItem));

  useEffect(() => {
    if (workspaceSurface.type === 'main' && isMetadataItemMissing) {
      navigateApp(AppPath.NotFound);
    }
  }, [isMetadataItemMissing, navigateApp, workspaceSurface.type]);

  if (!isDefined(objectMetadataItem) || isMetadataItemMissing) {
    return workspaceSurface.type === 'side-panel' ? (
      <WorkspaceRouteUnavailable />
    ) : null;
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
