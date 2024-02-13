import { useRecoilValue } from 'recoil';

import { BlockListItem } from '@/accounts/types/BlockListItem';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsEmailsBlocklistInput } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistInput';
import { SettingsAccountsEmailsBlocklistTable } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistTable';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';

export const SettingsAccountsEmailsBlocklistSection = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { records: blockList } = useFindManyRecords<BlockListItem>({
    objectNameSingular: CoreObjectNameSingular.Blocklist,
  });

  const { createOneRecord: createBlockListItem } =
    useCreateOneRecord<BlockListItem>({
      objectNameSingular: CoreObjectNameSingular.Blocklist,
    });

  const { deleteOneRecord: deleteBlockListItem } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Blocklist,
  });

  const handleBlockedEmailRemove = (id: string) => {
    deleteBlockListItem(id);
  };

  const updateBlockedEmailList = (handle: string) => {
    createBlockListItem({
      handle,
      workspaceMemberId: currentWorkspaceMember?.id,
    });
  };

  return (
    <Section>
      <H2Title
        title="Blocklist"
        description="Exclude the following people and domains from my email sync"
      />
      <SettingsAccountsEmailsBlocklistInput
        updateBlockedEmailList={updateBlockedEmailList}
      />
      <SettingsAccountsEmailsBlocklistTable
        blocklist={blockList}
        handleBlockedEmailRemove={handleBlockedEmailRemove}
      />
    </Section>
  );
};
