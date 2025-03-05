import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { RolesTableHeader } from '@/settings/roles/components/RolesTableHeader';
import { RolesTableRow } from '@/settings/roles/components/RolesTableRow';
import { Button, H2Title, IconPlus, Section } from 'twenty-ui';
import { Role } from '~/generated-metadata/graphql';

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledBottomSection = styled(Section)`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(4)};
  display: flex;
  justify-content: flex-end;
`;

export const Roles = ({ roles }: { roles: Role[] }) => {
  return (
    <Section>
      <H2Title
        title={t`All roles`}
        description={t`Assign roles to specify each member's access permissions`}
      />
      <StyledTable>
        <RolesTableHeader />
        {roles.map((role) => (
          <RolesTableRow key={role.id} role={role} />
        ))}
      </StyledTable>
      <StyledBottomSection>
        <Button
          Icon={IconPlus}
          title={t`Create Role`}
          variant="secondary"
          size="small"
          soon
        />
      </StyledBottomSection>
    </Section>
  );
};
