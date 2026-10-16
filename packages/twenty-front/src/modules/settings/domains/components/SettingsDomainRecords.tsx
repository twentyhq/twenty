import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsDnsRecordsTable } from '@/settings/components/SettingsDnsRecordsTable';
import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/components/layout';
import { type ThemeColor } from 'twenty-ui/theme';
import {
  type DomainRecord,
  type DomainValidRecords,
} from '~/generated-metadata/graphql';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SettingsDomainRecords = ({
  records,
}: {
  records: DomainValidRecords['records'];
}) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const rowsDefinitions = [
    {
      name: doNotTranslate('Domain Setup'),
      validationType: 'redirection' as const,
    },
    {
      name: doNotTranslate('Secure Connection'),
      validationType: 'ssl' as const,
    },
  ];

  const defaultValues: { status: string; statusColor: ThemeColor } =
    currentWorkspace?.customDomain
      ? {
          status: 'success',
          statusColor: 'green',
        }
      : {
          status: 'loading',
          statusColor: 'gray',
        };

  const transformedRecords = rowsDefinitions.map<
    { statusColor: ThemeColor } & DomainRecord
  >((row) => {
    const record = records.find(
      ({ validationType }) => validationType === row.validationType,
    );

    if (!record) {
      throw new Error(doNotTranslate(`Record ${row.name} not found`));
    }

    return {
      statusColor:
        isDefined(record) && record.status === 'error'
          ? 'red'
          : isDefined(record) && record.status === 'pending'
            ? 'yellow'
            : defaultValues.statusColor,
      ...record,
    };
  });

  return (
    <Section.Root>
      <Section.Header
        title={t`Domain Setup`}
        description={t`Configure these DNS records with your domain provider`}
      />
      <SettingsDnsRecordsTable records={transformedRecords} />
    </Section.Root>
  );
};
