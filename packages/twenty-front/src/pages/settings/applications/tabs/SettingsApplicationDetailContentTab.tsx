import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { SettingsLogicFunctionsTable } from '@/settings/logic-functions/components/SettingsLogicFunctionsTable';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { type Application } from '~/generated-metadata/graphql';
import { SettingsAIAgentsTable } from '~/pages/settings/ai/components/SettingsAIAgentsTable';
import {
  SettingsApplicationDataTable,
  type ApplicationDataTableFieldItem,
  type ApplicationDataTableRow,
} from '~/pages/settings/applications/components/SettingsApplicationDataTable';

export const SettingsApplicationDetailContentTab = ({
  application,
}: {
  application?: Omit<Application, 'objects' | 'universalIdentifier'> & {
    objects: { id: string }[];
  };
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const applicationObjectIds = useMemo(
    () => application?.objects.map((object) => object.id) ?? [],
    [application?.objects],
  );

  const objectRows = useMemo((): ApplicationDataTableRow[] => {
    if (!isDefined(application) || application.objects.length === 0) {
      return [];
    }

    return objectMetadataItems
      .filter((objectMetadataItem) =>
        applicationObjectIds.includes(objectMetadataItem.id),
      )
      .map((objectMetadataItem) => {
        const nonSystemFields = objectMetadataItem.fields.filter(
          (field) => !isHiddenSystemField(field),
        );

        const fields: ApplicationDataTableFieldItem[] = nonSystemFields.map(
          (field) => ({
            key: field.id,
            label: field.label,
            icon: field.icon ?? undefined,
            type: field.type,
          }),
        );

        return {
          key: objectMetadataItem.nameSingular,
          labelPlural: objectMetadataItem.labelPlural,
          icon: objectMetadataItem.icon ?? undefined,
          fieldsCount: nonSystemFields.length,
          fields,
          link: getSettingsPath(SettingsPath.ObjectDetail, {
            objectNamePlural: objectMetadataItem.namePlural,
          }),
          tagItem: {
            isCustom: objectMetadataItem.isCustom,
            isRemote: objectMetadataItem.isRemote,
            applicationId: objectMetadataItem.applicationId,
          },
        };
      });
  }, [application, objectMetadataItems, applicationObjectIds]);

  const fieldGroupRows = useMemo((): ApplicationDataTableRow[] => {
    if (!isDefined(application)) {
      return [];
    }

    const FIELD_GROUP_DENY_LIST = ['timelineActivity', 'favorite'];

    const fieldGroupMap = new Map<
      string,
      {
        objectMetadataItemId: string;
        fields: ApplicationDataTableFieldItem[];
      }
    >();

    for (const objectMetadataItem of objectMetadataItems) {
      if (applicationObjectIds.includes(objectMetadataItem.id)) {
        continue;
      }

      if (FIELD_GROUP_DENY_LIST.includes(objectMetadataItem.nameSingular)) {
        continue;
      }

      const appFields = objectMetadataItem.fields.filter(
        (field) => field.applicationId === application.id,
      );

      if (appFields.length > 0) {
        fieldGroupMap.set(objectMetadataItem.id, {
          objectMetadataItemId: objectMetadataItem.id,
          fields: appFields.map((field) => ({
            key: field.id,
            label: field.label,
            icon: field.icon ?? undefined,
            type: field.type,
          })),
        });
      }
    }

    return Array.from(fieldGroupMap.values())
      .map((group) => {
        const objectMetadataItem = objectMetadataItems.find(
          (item) => item.id === group.objectMetadataItemId,
        );
        if (!isDefined(objectMetadataItem)) {
          return undefined;
        }

        return {
          key: objectMetadataItem.nameSingular ?? group.objectMetadataItemId,
          labelPlural: objectMetadataItem.labelPlural,
          icon: objectMetadataItem.icon ?? undefined,
          fieldsCount: group.fields.length,
          fields: group.fields,
          link: isDefined(objectMetadataItem)
            ? getSettingsPath(SettingsPath.ObjectDetail, {
                objectNamePlural: objectMetadataItem.namePlural,
              })
            : undefined,
          tagItem: {
            isCustom: objectMetadataItem?.isCustom,
            isRemote: objectMetadataItem?.isRemote,
            applicationId: objectMetadataItem?.applicationId,
          },
        };
      })
      .filter(isDefined);
  }, [objectMetadataItems, applicationObjectIds, application]);

  if (!isDefined(application)) {
    return null;
  }

  const { logicFunctions, agents } = application;

  const shouldDisplayLogicFunctions =
    isDefined(logicFunctions) && logicFunctions?.length > 0;

  const shouldDisplayAgents = isDefined(agents) && agents.length > 0;

  return (
    <>
      <SettingsApplicationDataTable
        objectRows={objectRows}
        fieldGroupRows={fieldGroupRows}
      />
      {shouldDisplayLogicFunctions && (
        <Section>
          <H2Title
            title={t`Functions`}
            description={t`Logic functions powering this app`}
          />
          <SettingsLogicFunctionsTable logicFunctions={logicFunctions} />
        </Section>
      )}
      {shouldDisplayAgents && (
        <Section>
          <H2Title
            title={t`Agents`}
            description={t`Agents powering this app`}
          />
          <SettingsAIAgentsTable />
        </Section>
      )}
    </>
  );
};
