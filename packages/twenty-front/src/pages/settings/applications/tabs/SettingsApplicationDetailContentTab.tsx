import {
  type LogicFunctionTableRow,
  SettingsLogicFunctionsTable,
} from '@/settings/logic-functions/components/SettingsLogicFunctionsTable';
import { useObjectAndFieldRows } from '@/settings/applications/hooks/useObjectAndFieldRows';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { type Manifest } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { type Application } from '~/generated-metadata/graphql';
import { SettingsApplicationDataTable } from '~/pages/settings/applications/components/SettingsApplicationDataTable';
import {
  type ApplicationNameDescriptionTableRow,
  SettingsApplicationNameDescriptionTable,
} from '~/pages/settings/applications/components/SettingsApplicationNameDescriptionTable';

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
