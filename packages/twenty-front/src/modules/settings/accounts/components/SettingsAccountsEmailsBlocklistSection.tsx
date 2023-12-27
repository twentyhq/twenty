import { useState } from 'react';
import { v4 } from 'uuid';

import { SettingsAccountsEmailsBlocklistInput } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistInput';
import { SettingsAccountsEmailsBlocklistTable } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistTable';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';
import { mockedBlockedEmailList } from '~/testing/mock-data/accounts';
import { formatDate } from '~/utils/date-utils';

export const SettingsAccountsEmailsBlocklistSection = () => {
  const [blockedEmailList, setBlockedEmailList] = useState(
    mockedBlockedEmailList,
  );

  const handleBlockedEmailRemove = (id: string) =>
    setBlockedEmailList((previousBlockedEmailList) =>
      previousBlockedEmailList.filter((blockedEmail) => blockedEmail.id !== id),
    );

  const updateBlockedEmailList = (email: string) =>
    setBlockedEmailList((prevState) => [
      ...prevState,
      {
        id: v4(),
        email: email,
        blocked_at: formatDate(new Date(), 'dd/LL/yyyy'),
      },
    ]);
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
        blockedEmailList={blockedEmailList}
        handleBlockedEmailRemove={handleBlockedEmailRemove}
      />
    </Section>
  );
};
