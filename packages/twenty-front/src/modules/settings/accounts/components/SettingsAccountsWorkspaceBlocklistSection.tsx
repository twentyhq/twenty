import { type BlocklistItem } from '@/accounts/types/BlocklistItem';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsBlocklistInput } from '@/settings/accounts/components/SettingsAccountsBlocklistInput';
import { SettingsAccountsBlocklistTable } from '@/settings/accounts/components/SettingsAccountsBlocklistTable';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useLingui } from '@lingui/react/macro';
import { BlocklistScope, CoreObjectNameSingular } from 'twenty-shared/types';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const SettingsAccountsWorkspaceBlocklistSection = () => {
  const { t } = useLingui();

  const canManageWorkspaceBlocklist = useHasPermissionFlag(
    PermissionFlagType.WORKSPACE,
  );

  const { records: workspaceBlocklist } = useFindManyRecords<BlocklistItem>({
    objectNameSingular: CoreObjectNameSingular.Blocklist,
    filter: {
      scope: { eq: BlocklistScope.WORKSPACE },
    },
    skip: !canManageWorkspaceBlocklist,
  });

  const { createManyRecords: createBlocklistItems } =
    useCreateManyRecords<BlocklistItem>({
      objectNameSingular: CoreObjectNameSingular.Blocklist,
    });

  const { deleteOneRecord: deleteBlocklistItem } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Blocklist,
  });

  if (!canManageWorkspaceBlocklist) {
    return null;
  }

  const handleBlockedEmailRemove = (id: string) => {
    deleteBlocklistItem(id);
  };

  const updateBlockedEmailList = (handles: string[]) => {
    createBlocklistItems({
      recordsToCreate: [...new Set(handles)].map((handle) => ({
        handle,
        scope: BlocklistScope.WORKSPACE,
      })),
    });
  };

  return (
    <Section>
      <H2Title
        title={t`Workspace blocklist`}
        description={t`Exclude the following people and domains from the email and calendar sync of every workspace member.`}
      />
      <SettingsAccountsBlocklistInput
        blockedEmailOrDomainList={workspaceBlocklist.map((item) => item.handle)}
        updateBlockedEmailList={updateBlockedEmailList}
      />
      <SettingsAccountsBlocklistTable
        blocklist={workspaceBlocklist}
        handleBlockedEmailRemove={handleBlockedEmailRemove}
      />
    </Section>
  );
};
