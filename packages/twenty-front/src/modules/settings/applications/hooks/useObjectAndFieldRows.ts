import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { type Manifest } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { type Application } from '~/generated-metadata/graphql';
import {
  type ApplicationFieldRow,
  type ApplicationObjectRow,
} from '~/pages/settings/applications/components/SettingsApplicationDataTable';
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

  const objectRows = useMemo((): ApplicationObjectRow[] => {
    if (isDefined(installedApplication)) {
      if (installedApplication.objects.length === 0) {
        return [];
      }

      return objectMetadataItems
        .filter((item) => installedObjectIds.has(item.id))
        .map((item) => ({
          key: item.nameSingular,
          labelPlural: item.labelPlural,
          icon: item.icon ?? undefined,
          fieldsCount: item.fields.filter((f) => !isHiddenSystemField(f))
            .length,
          link: getSettingsPath(SettingsPath.ObjectDetail, {
            objectNamePlural: item.namePlural,
          }),
        }));
    }

    return (manifestContent?.objects ?? []).map((appObject) => ({
      key: appObject.nameSingular,
      labelPlural: appObject.labelPlural,
      icon: appObject.icon ?? undefined,
      fieldsCount: appObject.fields.length,
    }));
  }, [
    installedApplication,
    manifestContent?.objects,
    objectMetadataItems,
    installedObjectIds,
  ]);

  const fieldRows = useMemo((): ApplicationFieldRow[] => {
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
              fieldLabel: field.label,
              fieldIcon: field.icon ?? undefined,
              objectLabel: item.labelSingular,
              objectIcon: item.icon ?? undefined,
              link: getSettingsPath(SettingsPath.ObjectDetail, {
                objectNamePlural: item.namePlural,
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
            fieldLabel: field.label ?? field.name,
            fieldIcon: field.icon ?? undefined,
            objectLabel: appObject.labelSingular,
            objectIcon: appObject.icon ?? undefined,
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
          fieldLabel: field.label ?? field.name,
          fieldIcon: field.icon ?? undefined,
          objectLabel: objectMetadataItem.labelSingular,
          objectIcon: objectMetadataItem.icon ?? undefined,
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
