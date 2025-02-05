import { t } from '@lingui/core/macro';
import { H2Title, Section } from 'twenty-ui';
import { Role } from '~/generated-metadata/graphql';

type RoleAssignmentProps = {
  role: Pick<Role, 'id' | 'label' | 'canUpdateAllSettings'>;
};

// eslint-disable-next-line unused-imports/no-unused-vars
export const RoleAssignment = ({ role }: RoleAssignmentProps) => {
  return (
    <Section>
      <H2Title
        title={t`Assigned members`}
        description={t`This Role is assigned to these workspace member.`}
      />
    </Section>
  );
};
