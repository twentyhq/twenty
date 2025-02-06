import { t } from '@lingui/core/macro';
import { H2Title, Section } from 'twenty-ui';
import { Role } from '~/generated-metadata/graphql';

type RolePermissionsProps = {
  role: Pick<Role, 'id' | 'label' | 'canUpdateAllSettings'>;
};

// eslint-disable-next-line unused-imports/no-unused-vars
export const RolePermissions = ({ role }: RolePermissionsProps) => {
  return (
    <Section>
      <H2Title
        title={t`Permissions`}
        description={t`This Role has the following permissions.`}
      />
    </Section>
  );
};
