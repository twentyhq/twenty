import { type ApplicationDisplayData } from '@/applications/types/applicationDisplayData.type';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { type ApplicationDataTableRow } from '~/pages/settings/applications/types/applicationDataTableRow';
import { findObjectNameByUniversalIdentifier } from '~/pages/settings/applications/utils/findObjectNameByUniversalIdentifier';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';

const FIELD_GROUP_DENY_LIST = ['timelineActivity', 'favorite'];

export const getManifestObjectAndFieldRows = ({
  manifestContent,
  objectMetadataItems,
  applicationInfo,
}: {
  manifestContent?: Manifest;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  applicationInfo?: ApplicationDisplayData;
}): {
  objectRows: ApplicationDataTableRow[];
  fieldGroupRows: ApplicationDataTableRow[];
} => {
  const manifestObjects = manifestContent?.objects ?? [];
  const manifestFields = manifestContent?.fields ?? [];

  const objectRows: ApplicationDataTableRow[] = manifestObjects
    .map((appObject) => ({
      key: appObject.nameSingular,
      labelPlural: appObject.labelPlural,
      icon: appObject.icon ?? undefined,
      fieldsCount: appObject.fields.filter((f) => !isHiddenSystemField(f))
        .length,
      application: applicationInfo ?? {},
    }))
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  if (manifestFields.length === 0) {
    return { objectRows, fieldGroupRows: [] };
  }

  const manifestObjectUids = new Set(
    manifestObjects.map((obj) => obj.universalIdentifier),
  );

  const groupMap = new Map<
    string,
    { objectUniversalIdentifier: string; count: number }
  >();

  for (const field of manifestFields) {
    const objectUid = field.objectUniversalIdentifier;

    if (manifestObjectUids.has(objectUid)) {
      continue;
    }

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

  const fieldGroupRows: ApplicationDataTableRow[] = Array.from(
    groupMap.values(),
  )
    .map((group) => {
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

      if (FIELD_GROUP_DENY_LIST.includes(objectMetadataItem.nameSingular)) {
        return;
      }

      return {
        key: objectMetadataItem.nameSingular,
        labelPlural: objectMetadataItem.labelPlural,
        icon: objectMetadataItem.icon ?? undefined,
        fieldsCount: group.count,
        application: applicationInfo ?? {},
      };
    })
    .filter(isDefined);

  return { objectRows, fieldGroupRows };
};
