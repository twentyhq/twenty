import { t } from '@lingui/core/macro';
import { IconLock } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';
import { ListItem } from 'twenty-ui/primitives/navigation';

import { SidePanelShareRecordGroup } from '@/side-panel/pages/share-record/components/SidePanelShareRecordGroup';
import { type RecordSharingFieldsFragment } from '~/generated-metadata/graphql';

type SidePanelRecordRoleAccessProps = {
  roles: RecordSharingFieldsFragment['roles'];
  search: string;
};

export const SidePanelRecordRoleAccess = ({
  roles,
  search,
}: SidePanelRecordRoleAccessProps) => {
  const matchingRoles = roles.filter(
    (role) =>
      (role.canRead || role.hasSomeReadAccess) &&
      role.label.toLowerCase().includes(search.toLowerCase()),
  );
  if (matchingRoles.length === 0) return null;

  return (
    <SidePanelShareRecordGroup heading={t`Through roles`}>
      {matchingRoles.map((role) => (
        <ListItem
          key={role.id}
          startIcon={<IconLock size={16} />}
          description={
            role.canUpdate
              ? t`Can edit`
              : role.hasSomeUpdateAccess
                ? t`Some can edit`
                : role.canRead
                  ? t`Can view`
                  : t`Some can view`
          }
          descriptionPlacement="end"
        >
          {role.label}
        </ListItem>
      ))}
      <Text size="xs" color="light">{t`Access can vary by member.`}</Text>
    </SidePanelShareRecordGroup>
  );
};
