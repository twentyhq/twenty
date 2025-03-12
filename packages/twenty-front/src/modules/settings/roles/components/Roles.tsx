import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { RolesTableHeader } from '@/settings/roles/components/RolesTableHeader';
import { RolesTableRow } from '@/settings/roles/components/RolesTableRow';
import { Button, H2Title, IconPlus, Section } from 'twenty-ui';
import { Role } from '~/generated-metadata/graphql';

const StyledCreateRoleSection = styled(Section)`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

export const Roles = ({ roles }: { roles: Role[] }) => {
  return (
    <Section>
      <H2Title
        title={t`All roles`}
        description={t`Assign roles to specify each member's access permissions`}
      />
      <Table>
        <RolesTableHeader />
        <StyledTableRows>
          {roles.map((role) => (
            <RolesTableRow key={role.id} role={role} />
          ))}
        </StyledTableRows>
      </Table>
      <StyledCreateRoleSection>
        <Button
          Icon={IconPlus}
          title={t`Create Role`}
          variant="secondary"
          size="small"
          soon
        />
      </StyledCreateRoleSection>
    </Section>
  );
};
