import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';

import { GET_CONFIG_VARS } from '@/settings/admin-panel/graphql/queries/getConfigVars';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { H1Title, H2Title, Section } from 'twenty-ui';
import { SettingsPath } from '~/modules/types/SettingsPath';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledGroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableRow = styled(TableRow)`
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledInfoText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
`;

export const SettingsAdminEnvVarDebug = () => {
  const { data, loading, error } = useQuery(GET_CONFIG_VARS, {
    fetchPolicy: 'network-only',
  });

  if (loading === true) return <div>Loading...</div>;
  if (error !== undefined) return <div>Error: {error.message}</div>;

  const configVars = data?.configVars || [];
  const groups = [...new Set(configVars.map((v: any) => v.metadata.group))];

  return (
    <StyledContainer>
      <H1Title title={t`Environment Variable Debug`} />

      <Section>
        <StyledInfoText>
          {t`Click on any variable to view its details and edit its value if applicable.`}
        </StyledInfoText>
      </Section>

      {groups.map((group: any) => (
        <StyledGroupContainer key={group}>
          <H2Title title={group} />
          <Table>
            <TableRow>
              <TableHeader>{t`Name`}</TableHeader>
              <TableHeader>{t`Description`}</TableHeader>
              <TableHeader align="right">{t`Value`}</TableHeader>
            </TableRow>
            <StyledTableBody>
              {configVars
                .filter((v: any) => v.metadata.group === group)
                .map((configVar: any) => (
                  <Link
                    key={configVar.key}
                    to={getSettingsPath(SettingsPath.AdminPanelEnvVarDetail, {
                      envVarKey: configVar.key,
                    })}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <StyledTableRow>
                      <div>{configVar.key}</div>
                      <div>{configVar.metadata.description}</div>
                      <div style={{ textAlign: 'right' }}>
                        {configVar.metadata.sensitive
                          ? '••••••'
                          : String(configVar.value)}
                      </div>
                    </StyledTableRow>
                  </Link>
                ))}
            </StyledTableBody>
          </Table>
        </StyledGroupContainer>
      ))}
    </StyledContainer>
  );
};
