import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { SettingsLogicFunctionsTable } from '@/settings/logic-functions/components/SettingsLogicFunctionsTable';
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
  SettingsApplicationDataTable,
  type ApplicationDataTableRow,
} from '~/pages/settings/applications/components/SettingsApplicationDataTable';
import { SettingsApplicationNameDescriptionTable } from '~/pages/settings/applications/components/SettingsApplicationNameDescriptionTable';
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

export const SettingsApplicationDetailContentTab = ({
  applicationId,
  installedApplication,
  manifestContent,
}: SettingsApplicationDetailContentTabProps) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  // Installed app: object rows from workspace metadata
  const installedObjectIds = useMemo(
    () => installedApplication?.objects.map((object) => object.id) ?? [],
    [installedApplication?.objects],
  );

  const installedObjectRows = useMemo((): ApplicationDataTableRow[] => {
    if (
      !isDefined(installedApplication) ||
      installedApplication.objects.length === 0
    ) {
      return [];
    }

    return objectMetadataItems
      .filter((item) => installedObjectIds.includes(item.id))
      .map((item) => ({
        key: item.nameSingular,
        labelPlural: item.labelPlural,
        icon: item.icon ?? undefined,
        fieldsCount: item.fields.filter((f) => !isHiddenSystemField(f)).length,
        link: getSettingsPath(SettingsPath.ObjectDetail, {
          objectNamePlural: item.namePlural,
        }),
        tagItem: {
          isCustom: item.isCustom,
          isRemote: item.isRemote,
          applicationId: item.applicationId,
        },
      }));
  }, [installedApplication, objectMetadataItems, installedObjectIds]);

  const installedFieldGroupRows = useMemo((): ApplicationDataTableRow[] => {
    if (!isDefined(installedApplication)) {
      return [];
    }

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
  }, [objectMetadataItems, installedObjectIds, installedApplication]);

  // Manifest: object rows from manifest data
  const manifestObjects = useMemo(
    () => manifestContent?.objects ?? [],
    [manifestContent?.objects],
  );
  const manifestFields = useMemo(
    () => manifestContent?.fields ?? [],
    [manifestContent?.fields],
  );

  const manifestObjectRows = useMemo(
    (): ApplicationDataTableRow[] =>
      manifestObjects.map((appObject) => ({
        key: appObject.nameSingular,
        labelPlural: appObject.labelPlural,
        icon: appObject.icon ?? undefined,
        fieldsCount: appObject.fields.length,
        tagItem: { applicationId },
      })),
    [manifestObjects, applicationId],
  );

  const manifestFieldGroupRows = useMemo((): ApplicationDataTableRow[] => {
    if (manifestFields.length === 0) {
      return [];
    }

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
          link: getSettingsPath(SettingsPath.ObjectDetail, {
            objectNamePlural: objectMetadataItem.namePlural,
          }),
          tagItem: {},
        };
      })
      .filter(isDefined);
  }, [manifestFields, objectMetadataItems, manifestObjects, applicationId]);

  // Choose data source: installed app data takes precedence
  const objectRows = isDefined(installedApplication)
    ? installedObjectRows
    : manifestObjectRows;
  const fieldGroupRows = isDefined(installedApplication)
    ? installedFieldGroupRows
    : manifestFieldGroupRows;

  // Front components
  const frontComponentItems = useMemo(() => {
    if (isDefined(installedApplication)) {
      return (installedApplication.frontComponents ?? []).map((fc) => ({
        name: fc.name,
        description: fc.description,
      }));
    }

    return (manifestContent?.frontComponents ?? []).map((fc) => ({
      name: fc.name ?? fc.universalIdentifier,
      description: fc.description,
    }));
  }, [installedApplication, manifestContent?.frontComponents]);

  // Logic functions
  const installedLogicFunctions = installedApplication?.logicFunctions;
  const hasInstalledLogicFunctions =
    isDefined(installedLogicFunctions) && installedLogicFunctions.length > 0;

  const manifestLogicFunctionItems = useMemo(() => {
    if (isDefined(installedApplication)) {
      return [];
    }

    return (manifestContent?.logicFunctions ?? []).map((lf) => ({
      name: lf.name ?? lf.universalIdentifier,
      description: lf.description,
    }));
  }, [installedApplication, manifestContent?.logicFunctions]);

  return (
    <>
      <SettingsApplicationDataTable
        objectRows={objectRows}
        fieldGroupRows={fieldGroupRows}
      />
      {hasInstalledLogicFunctions && (
        <Section>
          <H2Title
            title={t`Logic`}
            description={t`Logic functions powering this app`}
          />
          <SettingsLogicFunctionsTable
            logicFunctions={installedLogicFunctions}
          />
        </Section>
      )}
      {!isDefined(installedApplication) && (
        <SettingsApplicationNameDescriptionTable
          title={t`Logic functions`}
          description={t`Logic functions provided by this app`}
          sectionTitle={t`Logic functions`}
          items={manifestLogicFunctionItems}
        />
      )}
      <SettingsApplicationNameDescriptionTable
        title={t`Front components`}
        description={t`UI components provided by this app`}
        sectionTitle={t`Front components`}
        items={frontComponentItems}
      />
    </>
  );
};
