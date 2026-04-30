import { type ApplicationDisplayData } from '@/applications/types/applicationDisplayData.type';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { type Application } from '~/generated-metadata/graphql';
import { type ApplicationDataTableRow } from '~/pages/settings/applications/types/applicationDataTableRow';

const FIELD_GROUP_DENY_LIST = ['timelineActivity', 'favorite'];

type InstalledApplication = Omit<Application, 'objects' | 'frontComponents'> & {
  objects: { id: string }[];
};

export const getInstalledApplicationObjectAndFieldRows = ({
  installedApplication,
  objectMetadataItems,
  installedApplications,
}: {
  installedApplication: InstalledApplication;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  installedApplications?: ApplicationDisplayData[];
}): {
  objectRows: ApplicationDataTableRow[];
  fieldGroupRows: ApplicationDataTableRow[];
} => {
  const installedObjectIds = installedApplication.objects.map(
    (object) => object.id,
  );

  const objectRows: ApplicationDataTableRow[] =
    installedApplication.objects.length === 0
      ? []
      : objectMetadataItems
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
            application: {
              id: installedApplication.id,
              logo: installedApplication.logo,
              name: installedApplication.name,
              universalIdentifier: installedApplication.universalIdentifier,
            },
          }))
          .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const fieldGroupRows: ApplicationDataTableRow[] = objectMetadataItems
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
      application:
        installedApplications?.find((app) => app.id === item.applicationId) ??
        {},
    }));

  return { objectRows, fieldGroupRows };
};
