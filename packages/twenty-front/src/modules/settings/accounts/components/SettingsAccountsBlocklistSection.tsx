import { useRecoilValue } from 'recoil';
import { H2Title, Section } from 'twenty-ui';

import { BlocklistItem } from '@/accounts/types/BlocklistItem';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingAccountsBlocklistContainer } from '@/settings/accounts/components/SettingAccountsBlocklistContainer';
import { BlocklistContext } from '@/settings/accounts/contexts/BlocklistContext';
import { useState } from 'react';
import { NullableString } from '~/types/NullableString';

export const SettingsAccountsBlocklistSection = () => {
  const [savedContactIdBeingUpdated, setSavedContactIdBeingUpdated] =
    useState<NullableString>(null);

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

  const { updateOneRecord: updateBlocklistEmail } =
    useUpdateOneRecord<BlocklistItem>({
      objectNameSingular: CoreObjectNameSingular.Blocklist,
    });

  const handleBlockedEmailRemove = (id: string) => {
    deleteBlocklistItem(id);
  };

  const addNewBlockedEmail = (contact: BlocklistItem) => {
    createBlocklistItem({
      levels: contact.levels,
      handle: contact.handle,
      workspaceMemberId: currentWorkspaceMember?.id,
    });
  };

  const updateBlockedEmail = (contact: BlocklistItem) => {
    updateBlocklistEmail({
      idToUpdate: contact.id,
      updateOneRecordInput: {
        levels: contact.levels,
        handle: contact.handle,
      },
    });
  };

  return (
    <Section>
      <H2Title
        title="Blocklist"
        description="Exclude the following people and domains from my email sync"
      />
      <BlocklistContext.Provider
        value={{
          blocklist,
          savedContactIdBeingUpdated,
          setSavedContactIdBeingUpdated,
          handleBlockedEmailRemove,
          updateBlockedEmail,
          addNewBlockedEmail,
        }}
      >
        <SettingAccountsBlocklistContainer />
      </BlocklistContext.Provider>
    </Section>
  );
};
