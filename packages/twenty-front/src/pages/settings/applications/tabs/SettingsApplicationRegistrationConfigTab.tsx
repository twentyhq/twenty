import type { ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';
import { useQuery } from '@apollo/client/react';
import {
  type ApplicationRegistrationVariable,
  FindApplicationRegistrationVariablesDocument,
} from '~/generated-metadata/graphql';
import { Section } from 'twenty-ui/layout';
import {
  H2Title,
  IconChevronRight,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { Table } from '@/ui/layout/table/components/Table';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { SettingsApplicationRegistrationConfigVariableStatus } from '~/pages/settings/applications/components/SettingsApplicationRegistrationConfigVariableStatus';

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

export const SettingsApplicationRegistrationConfigTab = ({
  registration,
}: {
  registration: ApplicationRegistrationData;
}) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();

  const applicationRegistrationId = registration.id;

  const { data: variablesData } = useQuery(
    FindApplicationRegistrationVariablesDocument,
    {
      variables: { applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const variables: ApplicationRegistrationVariable[] =
    variablesData?.findApplicationRegistrationVariables ?? [];

  return (
    variables.length > 0 && (
      <Section>
        <H2Title
          title={t`Server Variables`}
          description={t`Server variables are applied to all workspace installations.`}
        />
        <Table>
          <TableRow gridAutoColumns="4fr 3fr 3fr 1fr">
            <TableHeader>{t`Name`}</TableHeader>
            <TableHeader>{t`Description`}</TableHeader>
            <TableHeader align="right">{t`Status`}</TableHeader>
            <TableHeader align="right"></TableHeader>
          </TableRow>
          <StyledTableBodyContainer>
            <TableBody>
              {variables.map((variable) => (
                <TableRow
                  key={variable.key}
                  gridAutoColumns="4fr 3fr 3fr 1fr"
                  to={getSettingsPath(
                    SettingsPath.ApplicationRegistrationConfigVariableDetails,
                    {
                      applicationRegistrationId,
                      variableKey: variable.key,
                    },
                  )}
                >
                  <TableCell
                    color={theme.font.color.primary}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    clickable
                  >
                    <OverflowingTextWithTooltip text={variable.key} />
                    {variable.isRequired && (
                      <span style={{ color: 'red' }}> *</span>
                    )}
                  </TableCell>
                  <TableCell
                    color={theme.font.color.secondary}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    clickable
                  >
                    <OverflowingTextWithTooltip text={variable.description} />
                  </TableCell>
                  <TableCell
                    color={theme.font.color.secondary}
                    align="right"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    clickable
                  >
                    <SettingsApplicationRegistrationConfigVariableStatus
                      variable={variable}
                    />
                  </TableCell>
                  <TableCell align="right" color={theme.font.color.secondary}>
                    <IconChevronRight
                      size={theme.icon.size.md}
                      color={theme.font.color.tertiary}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </StyledTableBodyContainer>
        </Table>
      </Section>
    )
  );
};
