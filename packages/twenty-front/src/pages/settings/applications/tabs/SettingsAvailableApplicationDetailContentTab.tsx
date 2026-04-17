import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type Manifest } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  type ApplicationDataTableRow,
  SettingsApplicationDataTable,
} from '~/pages/settings/applications/components/SettingsApplicationDataTable';
import { SettingsApplicationNameDescriptionTable } from '~/pages/settings/applications/components/SettingsApplicationNameDescriptionTable';
import { findObjectNameByUniversalIdentifier } from '~/pages/settings/applications/utils/findObjectNameByUniversalIdentifier';

export const SettingsAvailableApplicationDetailContentTab = ({
  applicationId,
  content,
}: {
  applicationId: string;
  content?: Manifest;
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const objects = useMemo(() => content?.objects ?? [], [content?.objects]);
  const fields = useMemo(() => content?.fields ?? [], [content?.fields]);
  const logicFunctions = content?.logicFunctions ?? [];
  const frontComponents = content?.frontComponents ?? [];

  const objectRows = useMemo(
    (): ApplicationDataTableRow[] =>
      objects.map((appObject) => ({
        key: appObject.nameSingular,
        labelPlural: appObject.labelPlural,
        icon: appObject.icon ?? undefined,
        fieldsCount: appObject.fields.length,
        tagItem: { applicationId },
      })),
    [objects, applicationId],
  );

  const fieldGroupRows = useMemo((): ApplicationDataTableRow[] => {
    if (fields.length === 0) {
      return [];
    }

    const groupMap = new Map<
      string,
      {
        objectUniversalIdentifier: string;
        count: number;
      }
    >();

    for (const field of fields) {
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

    return Array.from(groupMap.values()).map((group) => {
      const appObject = objects.find(
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
        throw new Error(
          `Could not resolve object for universalIdentifier: ${group.objectUniversalIdentifier}`,
        );
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
    });
  }, [fields, objectMetadataItems, objects, applicationId]);

  const roles = content?.roles ?? [];
  const skills = content?.skills ?? [];
  const agents = content?.agents ?? [];
  const views = content?.views ?? [];
  const navigationMenuItems = content?.navigationMenuItems ?? [];
  const pageLayouts = content?.pageLayouts ?? [];

  return (
    <>
      <SettingsApplicationDataTable
        objectRows={objectRows}
        fieldGroupRows={fieldGroupRows}
      />
      <SettingsApplicationNameDescriptionTable
        title={t`Logic functions`}
        description={t`Logic functions provided by this app`}
        sectionTitle={t`Logic functions`}
        items={logicFunctions.map((lf) => ({
          name: lf.name ?? lf.universalIdentifier,
          description: lf.description,
        }))}
      />
      <SettingsApplicationNameDescriptionTable
        title={t`Front components`}
        description={t`UI components provided by this app`}
        sectionTitle={t`Front components`}
        items={frontComponents.map((fc) => ({
          name: fc.name ?? fc.universalIdentifier,
          description: fc.description,
        }))}
      />
      <SettingsApplicationNameDescriptionTable
        title={t`Roles`}
        description={t`Roles defined by this app`}
        sectionTitle={t`Roles`}
        items={roles.map((role) => ({
          name: role.label,
          description: role.description,
        }))}
      />
      <SettingsApplicationNameDescriptionTable
        title={t`Skills`}
        description={t`Skills provided by this app`}
        sectionTitle={t`Skills`}
        items={skills.map((skill) => ({
          name: skill.label ?? skill.name,
          description: skill.description,
        }))}
      />
      <SettingsApplicationNameDescriptionTable
        title={t`Agents`}
        description={t`Agents provided by this app`}
        sectionTitle={t`Agents`}
        items={agents.map((agent) => ({
          name: agent.label ?? agent.name,
          description: agent.description,
        }))}
      />
      <SettingsApplicationNameDescriptionTable
        title={t`Views`}
        description={t`Views created by this app`}
        sectionTitle={t`Views`}
        items={views.map((view) => ({
          name: view.name,
        }))}
      />
      <SettingsApplicationNameDescriptionTable
        title={t`Navigation menu items`}
        description={t`Navigation items added by this app`}
        sectionTitle={t`Navigation items`}
        items={navigationMenuItems.map((item) => ({
          name: item.name ?? item.universalIdentifier,
        }))}
      />
      <SettingsApplicationNameDescriptionTable
        title={t`Page layouts`}
        description={t`Page layouts defined by this app`}
        sectionTitle={t`Page layouts`}
        items={pageLayouts.map((layout) => ({
          name: layout.name,
        }))}
      />
    </>
  );
};
