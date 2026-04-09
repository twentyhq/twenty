import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { SettingsLogicFunctionsTable } from '@/settings/logic-functions/components/SettingsLogicFunctionsTable';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { type Application } from '~/generated-metadata/graphql';
import { SettingsAIAgentsTable } from '~/pages/settings/ai/components/SettingsAIAgentsTable';
import {
  SettingsApplicationDataTable,
  type ApplicationDataTableRow,
} from '~/pages/settings/applications/components/SettingsApplicationDataTable';

export const SettingsApplicationDetailContentTab = ({
  application,
}: {
  application?: Omit<Application, 'objects' | 'universalIdentifier'> & {
    objects: { id: string }[];
  };
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

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

        return {
          key: objectMetadataItem.nameSingular,
          labelPlural: objectMetadataItem.labelPlural,
          icon: objectMetadataItem.icon ?? undefined,
          fieldsCount: nonSystemFields.length,
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

    return objectMetadataItems
      .filter((objectMetadataItem) => {
        if (applicationObjectIds.includes(objectMetadataItem.id)) {
          return false;
        }

        if (FIELD_GROUP_DENY_LIST.includes(objectMetadataItem.nameSingular)) {
          return false;
        }

        const appFields = objectMetadataItem.fields.filter(
          (field) => field.applicationId === application.id,
        );

        return appFields.length > 0;
      })
      .map((objectMetadataItem) => {
        const appFieldsCount = objectMetadataItem.fields.filter(
          (field) => field.applicationId === application.id,
        ).length;

        return {
          key: objectMetadataItem.nameSingular,
          labelPlural: objectMetadataItem.labelPlural,
          icon: objectMetadataItem.icon ?? undefined,
          fieldsCount: appFieldsCount,
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
  }, [objectMetadataItems, applicationObjectIds, application]);

  if (!isDefined(application)) {
    return null;
  }

  const { logicFunctions, agents } = application;

  const shouldDisplayLogicFunctions =
    isDefined(logicFunctions) && logicFunctions?.length > 0;

  // TODO: uncomment when adding back agents in application settings
  // const shouldDisplayAgents = isDefined(agents) && agents.length > 0;
  const shouldDisplayAgents = false;

  return (
    <>
      <SettingsApplicationDataTable
        objectRows={objectRows}
        fieldGroupRows={fieldGroupRows}
      />
      {shouldDisplayLogicFunctions && (
        <Section>
          <H2Title
            title={t`Logic`}
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
