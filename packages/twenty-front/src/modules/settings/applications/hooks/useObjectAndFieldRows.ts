import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { type Manifest } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { type Application } from '~/generated-metadata/graphql';
import { type ApplicationContentRow } from '~/pages/settings/applications/components/SettingsApplicationContentSubtable';
import { findObjectNameByUniversalIdentifier } from '~/pages/settings/applications/utils/findObjectNameByUniversalIdentifier';

type InstalledApplicationForObjectRows = Omit<
  Application,
  'objects' | 'universalIdentifier' | 'frontComponents'
> & {
  objects: { id: string }[];
};

// Framework plumbing that always carries app-contributed fields but isn't
// useful to show as something the app extends.
const FIELD_GROUP_DENY_LIST = new Set(['timelineActivity', 'favorite']);

export const useObjectAndFieldRows = ({
  installedApplication,
  manifestContent,
}: {
  installedApplication?: InstalledApplicationForObjectRows;
  manifestContent?: Manifest;
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const installedObjectIds = useMemo(
    () => new Set(installedApplication?.objects.map((object) => object.id)),
    [installedApplication?.objects],
  );

  const objectRows = useMemo((): ApplicationContentRow[] => {
    if (isDefined(installedApplication)) {
      if (installedApplication.objects.length === 0) {
        return [];
      }

      return objectMetadataItems
        .filter((item) => installedObjectIds.has(item.id))
        .map((item) => {
          const fieldsCount = item.fields.filter(
            (f) => !isHiddenSystemField(f),
          ).length;
          return {
            key: item.nameSingular,
            name: item.labelPlural,
            icon: item.icon ?? undefined,
            secondary: t`${fieldsCount} fields`,
            link: getSettingsPath(SettingsPath.ObjectDetail, {
              objectNamePlural: item.namePlural,
            }),
          };
        });
    }

    return (manifestContent?.objects ?? []).map((appObject) => ({
      key: appObject.nameSingular,
      name: appObject.labelPlural,
      icon: appObject.icon ?? undefined,
      secondary: t`${appObject.fields.length} fields`,
    }));
  }, [
    installedApplication,
    manifestContent?.objects,
    objectMetadataItems,
    installedObjectIds,
  ]);

  const fieldRows = useMemo((): ApplicationContentRow[] => {
    if (isDefined(installedApplication)) {
      return objectMetadataItems
        .filter(
          (item) =>
            !installedObjectIds.has(item.id) &&
            !FIELD_GROUP_DENY_LIST.has(item.nameSingular),
        )
        .flatMap((item) =>
          item.fields
            .filter((field) => field.applicationId === installedApplication.id)
            .map((field) => ({
              key: `${item.id}-${field.id}`,
              name: field.label,
              icon: field.icon ?? undefined,
              secondary: t`on ${item.labelSingular}`,
              link: getSettingsPath(SettingsPath.ObjectFieldEdit, {
                objectNamePlural: item.namePlural,
                fieldName: field.name,
              }),
            })),
        );
    }

    const manifestFields = manifestContent?.fields ?? [];
    const manifestObjects = manifestContent?.objects ?? [];

    if (manifestFields.length === 0) return [];

    const manifestObjectByUid = new Map(
      manifestObjects.map((obj) => [obj.universalIdentifier, obj]),
    );

    return manifestFields
      .map((field) => {
        const appObject = manifestObjectByUid.get(
          field.objectUniversalIdentifier,
        );

        if (isDefined(appObject)) {
          return {
            key: `${appObject.nameSingular}-${field.universalIdentifier}`,
            name: field.label ?? field.name,
            icon: field.icon ?? undefined,
            secondary: t`on ${appObject.labelSingular}`,
          };
        }

        const standardObjectName = findObjectNameByUniversalIdentifier(
          field.objectUniversalIdentifier,
        );
        const objectMetadataItem = isDefined(standardObjectName)
          ? objectMetadataItems.find(
              (item) => item.nameSingular === standardObjectName,
            )
          : undefined;

        if (!isDefined(objectMetadataItem)) {
          return undefined;
        }

        return {
          key: `${objectMetadataItem.nameSingular}-${field.universalIdentifier}`,
          name: field.label ?? field.name,
          icon: field.icon ?? undefined,
          secondary: t`on ${objectMetadataItem.labelSingular}`,
        };
      })
      .filter(isDefined);
  }, [
    installedApplication,
    manifestContent?.fields,
    manifestContent?.objects,
    objectMetadataItems,
    installedObjectIds,
  ]);

  return { objectRows, fieldRows };
};
