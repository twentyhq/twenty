import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { type Manifest } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { type Application } from '~/generated-metadata/graphql';
import { type ApplicationContentRow } from '~/pages/settings/applications/components/SettingsApplicationContentSubtable';

type InstalledApplicationForObjectAndFields = Omit<
  Application,
  'objects' | 'universalIdentifier' | 'frontComponents' | 'commandMenuItems'
> & {
  objects: { id: string }[];
};

const FIELD_GROUP_DENY_LIST = new Set(['timelineActivity', 'favorite']);

export const useComputeObjectAndFieldsContentForApplication = ({
  installedApplication,
  manifestContent,
}: {
  installedApplication?: InstalledApplicationForObjectAndFields;
  manifestContent?: Manifest;
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const installedObjectIds = new Set(
    installedApplication?.objects.map((object) => object.id),
  );

  const objectRows: ApplicationContentRow[] = isDefined(installedApplication)
    ? objectMetadataItems
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
        })
    : (manifestContent?.objects ?? []).map((appObject) => ({
        key: appObject.nameSingular,
        name: appObject.labelPlural,
        icon: appObject.icon ?? undefined,
        secondary: t`${appObject.fields.length} fields`,
      }));

  const fieldRows: ApplicationContentRow[] = isDefined(installedApplication)
    ? objectMetadataItems
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
              applicationId: item?.applicationId ?? undefined,
              icon: field.icon ?? undefined,
              secondary: t`on ${item.labelSingular}`,
              link: getSettingsPath(SettingsPath.ObjectFieldEdit, {
                objectNamePlural: item.namePlural,
                fieldName: field.name,
              }),
            })),
        )
    : (() => {
        const manifestFields = manifestContent?.fields ?? [];
        const manifestObjectByUid = new Map(
          (manifestContent?.objects ?? []).map((obj) => [
            obj.universalIdentifier,
            obj,
          ]),
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

            const objectMetadataItem = objectMetadataItems.find(
              (item) =>
                item.universalIdentifier === field.objectUniversalIdentifier,
            );

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
      })();

  return { objectRows, fieldRows };
};
