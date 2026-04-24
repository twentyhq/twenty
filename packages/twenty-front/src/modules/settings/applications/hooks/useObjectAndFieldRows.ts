import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { type Manifest } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { type Application } from '~/generated-metadata/graphql';
import { type ApplicationDataTableRow } from '~/pages/settings/applications/components/SettingsApplicationDataTable';
import { findObjectNameByUniversalIdentifier } from '~/pages/settings/applications/utils/findObjectNameByUniversalIdentifier';

type InstalledApplicationForObjectRows = Omit<
  Application,
  'objects' | 'universalIdentifier' | 'frontComponents'
> & {
  objects: { id: string }[];
};

export const useObjectAndFieldRows = ({
  applicationId,
  installedApplication,
  manifestContent,
}: {
  applicationId: string;
  installedApplication?: InstalledApplicationForObjectRows;
  manifestContent?: Manifest;
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const installedObjectIds = useMemo(
    () => installedApplication?.objects.map((object) => object.id) ?? [],
    [installedApplication?.objects],
  );

  const objectRows = useMemo((): ApplicationDataTableRow[] => {
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
          tagItem: {
            isCustom: item.isCustom,
            isRemote: item.isRemote,
            applicationId: item.applicationId,
          },
        }));
    }

    return (manifestContent?.objects ?? []).map((appObject) => ({
      key: appObject.nameSingular,
      labelPlural: appObject.labelPlural,
      icon: appObject.icon ?? undefined,
      fieldsCount: appObject.fields.length,
      tagItem: { applicationId },
    }));
  }, [
    installedApplication,
    manifestContent?.objects,
    objectMetadataItems,
    installedObjectIds,
    applicationId,
  ]);

  const fieldGroupRows = useMemo((): ApplicationDataTableRow[] => {
    if (isDefined(installedApplication)) {
      const FIELD_GROUP_DENY_LIST = ['timelineActivity', 'favorite'];

      return objectMetadataItems
        .filter((item) => {
          if (installedObjectIds.includes(item.id)) return false;
          if (FIELD_GROUP_DENY_LIST.includes(item.nameSingular)) return false;

          return item.fields.some(
            (field) => field.applicationId === installedApplication.id,
          );
        })
        .map((item) => ({
          key: item.nameSingular,
          labelPlural: item.labelPlural,
          icon: item.icon ?? undefined,
          fieldsCount: item.fields.filter(
            (field) => field.applicationId === installedApplication.id,
          ).length,
          link: getSettingsPath(SettingsPath.ObjectDetail, {
            objectNamePlural: item.namePlural,
          }),
          tagItem: {
            isCustom: item.isCustom,
            isRemote: item.isRemote,
            applicationId: item.applicationId,
          },
        }));
    }

    const manifestFields = manifestContent?.fields ?? [];
    const manifestObjects = manifestContent?.objects ?? [];

    if (manifestFields.length === 0) return [];

    const groupMap = new Map<
      string,
      { objectUniversalIdentifier: string; count: number }
    >();

    for (const field of manifestFields) {
      const objectUid = field.objectUniversalIdentifier;
      const existing = groupMap.get(objectUid);

      if (isDefined(existing)) {
        existing.count++;
      } else {
        groupMap.set(objectUid, {
          objectUniversalIdentifier: objectUid,
          count: 1,
        });
      }
    }

    return Array.from(groupMap.values())
      .map((group) => {
        const appObject = manifestObjects.find(
          (obj) => obj.universalIdentifier === group.objectUniversalIdentifier,
        );

        if (isDefined(appObject)) {
          return {
            key: appObject.nameSingular,
            labelPlural: appObject.labelPlural,
            icon: appObject.icon ?? undefined,
            fieldsCount: group.count,
            tagItem: { applicationId },
          };
        }

        const standardObjectName = findObjectNameByUniversalIdentifier(
          group.objectUniversalIdentifier,
        );

        const objectMetadataItem = isDefined(standardObjectName)
          ? objectMetadataItems.find(
              (item) => item.nameSingular === standardObjectName,
            )
          : undefined;

        if (!isDefined(objectMetadataItem)) {
          return;
        }

        return {
          key: objectMetadataItem.nameSingular,
          labelPlural: objectMetadataItem.labelPlural,
          icon: objectMetadataItem.icon ?? undefined,
          fieldsCount: group.count,
          tagItem: {},
        };
      })
      .filter(isDefined);
  }, [
    installedApplication,
    manifestContent?.fields,
    manifestContent?.objects,
    objectMetadataItems,
    installedObjectIds,
    applicationId,
  ]);

  return { objectRows, fieldGroupRows };
};
