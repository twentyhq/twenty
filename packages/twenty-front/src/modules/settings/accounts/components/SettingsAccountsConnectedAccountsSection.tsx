import { useState } from 'react';

import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';
import { mockedAccounts } from '~/testing/mock-data/accounts';

import { SettingsAccountsCard } from './SettingsAccountsCard';
import { SettingsAccountsEmptyStateCard } from './SettingsAccountsEmptyStateCard';

export const SettingsAccountsConnectedAccountsSection = () => {
  const [accounts, setAccounts] = useState(mockedAccounts);

  const handleAccountRemove = (uuid: string) =>
    setAccounts((previousAccounts) =>
      previousAccounts.filter((account) => account.uuid !== uuid),
    );

  return (
    <Section>
      <H2Title
        title="Connected accounts"
        description="Manage your internet accounts."
      />
      {accounts.length ? (
        <SettingsAccountsCard
          accounts={accounts}
          onAccountRemove={handleAccountRemove}
        />
      ) : (
        <SettingsAccountsEmptyStateCard />
      )}
    </Section>
  );
};
