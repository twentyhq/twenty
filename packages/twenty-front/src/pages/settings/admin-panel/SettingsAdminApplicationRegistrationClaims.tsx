import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { Tag } from 'twenty-ui/data-display';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';
import { FindAdminApplicationRegistrationClaimsDocument } from '~/generated-admin/graphql';

const CLAIMS_TABLE_GRID = '1fr 140px';

export const SettingsAdminApplicationRegistrationClaims = ({
  applicationRegistrationId,
}: {
  applicationRegistrationId: string;
}) => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();

  const { data } = useQuery(FindAdminApplicationRegistrationClaimsDocument, {
    client: apolloAdminClient,
    variables: { applicationRegistrationId },
  });

  const claims = data?.findAdminApplicationRegistrationClaims ?? [];

  if (claims.length === 0) {
    return null;
  }

  return (
    <Section>
      <H2Title
        title={t`Ownership`}
        description={t`The workspace that claimed this app registration`}
      />
      <Table>
        <TableRow gridAutoColumns={CLAIMS_TABLE_GRID}>
          <TableHeader>{t`Workspace`}</TableHeader>
          <TableHeader>{t`Status`}</TableHeader>
        </TableRow>
        <TableBody>
          {claims.map((claim) => (
            <TableRow
              key={claim.workspaceId}
              gridAutoColumns={CLAIMS_TABLE_GRID}
            >
              <TableCell overflow="hidden">
                {claim.workspaceDisplayName ?? claim.workspaceId}
              </TableCell>
              <TableCell>
                <Tag text={t`Owner`} color="green" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Section>
  );
};
