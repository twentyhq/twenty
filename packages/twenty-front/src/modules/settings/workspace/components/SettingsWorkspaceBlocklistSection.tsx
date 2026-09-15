import { type BlocklistItem } from '@/accounts/types/BlocklistItem';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsBlocklistInput } from '@/settings/accounts/components/SettingsAccountsBlocklistInput';
import { SettingsAccountsBlocklistTable } from '@/settings/accounts/components/SettingsAccountsBlocklistTable';
import { useLingui } from '@lingui/react/macro';
import { BlocklistScope, CoreObjectNameSingular } from 'twenty-shared/types';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

export const SettingsWorkspaceBlocklistSection = () => {
  const { t } = useLingui();

  const { records: workspaceBlocklist } = useFindManyRecords<BlocklistItem>({
    objectNameSingular: CoreObjectNameSingular.Blocklist,
    filter: {
      scope: { eq: BlocklistScope.WORKSPACE },
    },
  });

  const { createManyRecords: createBlocklistItems } =
    useCreateManyRecords<BlocklistItem>({
      objectNameSingular: CoreObjectNameSingular.Blocklist,
    });

  const { deleteOneRecord: deleteBlocklistItem } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Blocklist,
  });

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
        title={t`Blocklist`}
        description={t`Exclude the following people and domains from the email and calendar sync of every workspace member`}
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
