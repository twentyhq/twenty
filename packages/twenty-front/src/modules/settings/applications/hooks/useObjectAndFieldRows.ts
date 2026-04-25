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

// Objects that always carry app-contributed fields but aren't useful to surface
// here (timeline events and favorites are framework plumbing rather than
// user-facing data the app extends).
const FIELD_GROUP_DENY_LIST = ['timelineActivity', 'favorite'];

export const useObjectAndFieldRows = ({
  installedApplication,
  manifestContent,
}: {
  installedApplication?: InstalledApplicationForObjectRows;
  manifestContent?: Manifest;
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const installedObjectIds = useMemo(
    () => installedApplication?.objects.map((object) => object.id) ?? [],
    [installedApplication?.objects],
  );

  const objectRows = useMemo((): ApplicationObjectRow[] => {
    if (isDefined(installedApplication)) {
      if (installedApplication.objects.length === 0) {
        return [];
      }

      return objectMetadataItems
        .filter((item) => installedObjectIds.includes(item.id))
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
        .filter((item) => {
          if (installedObjectIds.includes(item.id)) return false;
          if (FIELD_GROUP_DENY_LIST.includes(item.nameSingular)) return false;
          return item.fields.some(
            (field) => field.applicationId === installedApplication.id,
          );
        })
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

    return manifestFields
      .map((field) => {
        const appObject = manifestObjects.find(
          (obj) => obj.universalIdentifier === field.objectUniversalIdentifier,
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

        // Field added to a standard object — resolve the object via its known
        // universal identifier so we can show its label.
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
