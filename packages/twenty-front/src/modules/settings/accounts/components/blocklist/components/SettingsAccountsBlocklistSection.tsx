import { BlocklistItem } from '@/accounts/types/BlocklistItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingAccountsBlocklistContainer } from '@/settings/accounts/components/blocklist/components/SettingAccountsBlocklistContainer';
import { H2Title, Section } from 'twenty-ui';

export const SettingsAccountsBlocklistSection = () => {
  const { records: blocklist } = useFindManyRecords<BlocklistItem>({
    objectNameSingular: CoreObjectNameSingular.Blocklist,
  });

  return (
    <Section>
      <H2Title
        title="Blocklist"
        description="Exclude the following people and domains from my email sync"
      />
      <SettingAccountsBlocklistContainer blocklist={blocklist ?? []} />
    </Section>
  );
};
