import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import {
  type LogicFunctionTableRow,
  SettingsLogicFunctionsTable,
} from '@/settings/logic-functions/components/SettingsLogicFunctionsTable';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type Manifest } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { type Application } from '~/generated-metadata/graphql';
import {
  type ApplicationDataTableRow,
  SettingsApplicationDataTable,
} from '~/pages/settings/applications/components/SettingsApplicationDataTable';
import {
  type ApplicationNameDescriptionTableRow,
  SettingsApplicationNameDescriptionTable,
} from '~/pages/settings/applications/components/SettingsApplicationNameDescriptionTable';
import { findObjectNameByUniversalIdentifier } from '~/pages/settings/applications/utils/findObjectNameByUniversalIdentifier';

type InstalledApplicationForContentTab = Omit<
  Application,
  'objects' | 'universalIdentifier' | 'frontComponents'
> & {
  objects: { id: string }[];
  frontComponents?: { name: string; description?: string | null }[];
};

type SettingsApplicationDetailContentTabProps = {
  applicationId: string;
  installedApplication?: InstalledApplicationForContentTab;
  manifestContent?: Manifest;
};

const useObjectAndFieldRows = ({
  applicationId,
  installedApplication,
  manifestContent,
}: SettingsApplicationDetailContentTabProps) => {
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

export const SettingsApplicationDetailContentTab = ({
  applicationId,
  installedApplication,
  manifestContent,
}: SettingsApplicationDetailContentTabProps) => {
  const { objectRows, fieldGroupRows } = useObjectAndFieldRows({
    applicationId,
    installedApplication,
    manifestContent,
  });

  const logicFunctionRows = useMemo((): LogicFunctionTableRow[] => {
    const computeTrigger = (lf: {
      isTool?: boolean;
      cronTriggerSettings?: unknown;
      httpRouteTriggerSettings?: unknown;
      databaseEventTriggerSettings?: { eventName?: string } | null;
    }): string => {
      if (lf.isTool) return 'Tool';
      if (lf.cronTriggerSettings) return 'Cron';
      if (lf.httpRouteTriggerSettings) return 'Route';
      if (lf.databaseEventTriggerSettings)
        return lf.databaseEventTriggerSettings.eventName ?? '';
      return '';
    };

    if (isDefined(installedApplication)) {
      return (installedApplication.logicFunctions ?? []).map((lf) => ({
        key: lf.id,
        name: lf.name,
        trigger: computeTrigger(lf),
        link: getSettingsPath(SettingsPath.ApplicationLogicFunctionDetail, {
          applicationId,
          logicFunctionId: lf.id,
        }),
      }));
    }

    return (manifestContent?.logicFunctions ?? []).map((lf) => ({
      key: lf.universalIdentifier,
      name: lf.name ?? lf.universalIdentifier,
      trigger: computeTrigger(lf),
    }));
  }, [installedApplication, manifestContent?.logicFunctions, applicationId]);

  const frontComponentRows =
    useMemo((): ApplicationNameDescriptionTableRow[] => {
      if (isDefined(installedApplication)) {
        return (installedApplication.frontComponents ?? []).map((fc) => ({
          key: fc.name,
          name: fc.name,
          description: fc.description,
        }));
      }

      return (manifestContent?.frontComponents ?? []).map((fc) => ({
        key: fc.universalIdentifier,
        name: fc.name ?? fc.universalIdentifier,
        description: fc.description,
      }));
    }, [installedApplication, manifestContent?.frontComponents]);

  return (
    <>
      <SettingsApplicationDataTable
        objectRows={objectRows}
        fieldGroupRows={fieldGroupRows}
      />
      {logicFunctionRows.length > 0 && (
        <Section>
          <H2Title
            title={t`Logic`}
            description={t`Logic functions powering this app`}
          />
          <SettingsLogicFunctionsTable logicFunctions={logicFunctionRows} />
        </Section>
      )}
      <SettingsApplicationNameDescriptionTable
        title={t`Front components`}
        description={t`UI components provided by this app`}
        sectionTitle={t`Front components`}
        items={frontComponentRows}
      />
    </>
  );
};
