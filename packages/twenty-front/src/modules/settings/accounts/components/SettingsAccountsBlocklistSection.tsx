import { useRecoilValue } from 'recoil';
import { H2Title, Section } from 'twenty-ui';

import { BlocklistItem } from '@/accounts/types/BlocklistItem';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsBlocklistInput } from '@/settings/accounts/components/SettingsAccountsBlocklistInput';
import { SettingsAccountsBlocklistTable } from '@/settings/accounts/components/SettingsAccountsBlocklistTable';
import { useLingui } from '@lingui/react/macro';

export const SettingsAccountsBlocklistSection = () => {
  const { t } = useLingui();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { records: blocklist } = useFindManyRecords<BlocklistItem>({
    objectNameSingular: CoreObjectNameSingular.Blocklist,
  });

  const { createOneRecord: createBlocklistItem } =
    useCreateOneRecord<BlocklistItem>({
      objectNameSingular: CoreObjectNameSingular.Blocklist,
    });

  const { deleteOneRecord: deleteBlocklistItem } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Blocklist,
  });

  const handleBlockedEmailRemove = (id: string) => {
    deleteBlocklistItem(id);
  };

  const updateBlockedEmailList = (handle: string) => {
    createBlocklistItem({
      handle,
      workspaceMemberId: currentWorkspaceMember?.id,
    });
  };

  return (
    <Section>
      <H2Title
        title={t`Blocklist`}
        description={t`Exclude the following people and domains from my email sync`}
      />
      <SettingsAccountsBlocklistInput
        blockedEmailOrDomainList={blocklist.map((item) => item.handle)}
        updateBlockedEmailList={updateBlockedEmailList}
      />
      <SettingsAccountsBlocklistTable
        blocklist={blocklist}
        handleBlockedEmailRemove={handleBlockedEmailRemove}
      />
    </Section>
  );
};
