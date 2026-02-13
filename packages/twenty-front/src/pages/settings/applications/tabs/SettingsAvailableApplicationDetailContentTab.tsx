import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { type MarketplaceApp } from '~/generated-metadata/graphql';
import {
  type ApplicationDataTableFieldItem,
  type ApplicationDataTableRow,
  SettingsApplicationDataTable,
} from '~/pages/settings/applications/components/SettingsApplicationDataTable';
import { SettingsApplicationNameDescriptionTable } from '~/pages/settings/applications/components/SettingsApplicationNameDescriptionTable';
import { findObjectNameByUniversalIdentifier } from '~/pages/settings/applications/utils/findObjectNameByUniversalIdentifier';

export const SettingsAvailableApplicationDetailContentTab = ({
  application,
}: {
  application: MarketplaceApp;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { objects, fields, logicFunctions, frontComponents } = application;

  const objectRows = useMemo(
    (): ApplicationDataTableRow[] =>
      (objects ?? []).map((appObject) => ({
        key: appObject.nameSingular,
        labelPlural: appObject.labelPlural,
        icon: appObject.icon ?? undefined,
        fieldsCount: appObject.fields.length,
        fields: appObject.fields.map(
          (field): ApplicationDataTableFieldItem => ({
            key: field.name,
            label: field.label,
            icon: field.icon ?? undefined,
            type: field.type,
          }),
        ),
        tagItem: { applicationId: application.id },
      })),
    [objects, application.id],
  );

  const fieldGroupRows = useMemo((): ApplicationDataTableRow[] => {
    if (!isDefined(fields) || fields.length === 0) {
      return [];
    }

    const groupMap = new Map<
      string,
      {
        objectUniversalIdentifier: string;
        fieldItems: ApplicationDataTableFieldItem[];
      }
    >();

    for (const field of fields) {
      if (!isDefined(field.objectUniversalIdentifier)) {
        continue;
      }

      const existing = groupMap.get(field.objectUniversalIdentifier);
      const fieldItem: ApplicationDataTableFieldItem = {
        key: field.name,
        label: field.label,
        icon: field.icon ?? undefined,
        type: field.type,
      };

      if (isDefined(existing)) {
        existing.fieldItems.push(fieldItem);
      } else {
        groupMap.set(field.objectUniversalIdentifier, {
          objectUniversalIdentifier: field.objectUniversalIdentifier,
          fieldItems: [fieldItem],
        });
      }
    }

    return Array.from(groupMap.values()).map((group) => {
      const appObject = objects?.find(
        (appObj) =>
          appObj.universalIdentifier === group.objectUniversalIdentifier,
      );

      if (isDefined(appObject)) {
        return {
          key: appObject.nameSingular,
          labelPlural: appObject.labelPlural,
          icon: appObject.icon ?? undefined,
          fieldsCount: group.fieldItems.length,
          fields: group.fieldItems,
          tagItem: { applicationId: application.id },
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
        fieldsCount: group.fieldItems.length,
        fields: group.fieldItems,
        link: getSettingsPath(SettingsPath.ObjectDetail, {
          objectNamePlural: objectMetadataItem.namePlural,
        }),
        tagItem: {},
      };
    });
  }, [fields, objectMetadataItems, objects, application.id]);

  return (
    <>
      <SettingsApplicationDataTable
        objectRows={objectRows}
        fieldGroupRows={fieldGroupRows}
      />
      <SettingsApplicationNameDescriptionTable
        title={t`Functions`}
        description={t`Logic functions provided by this app`}
        sectionTitle={t`Logic functions`}
        items={logicFunctions}
      />
      <SettingsApplicationNameDescriptionTable
        title={t`Front components`}
        description={t`UI components provided by this app`}
        sectionTitle={t`Front components`}
        items={frontComponents}
      />
    </>
  );
};
