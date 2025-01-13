import { BlocklistItem } from '@/accounts/types/BlocklistItem';
import { SettingsAccountsBlocklistContactRow } from '@/settings/accounts/components/blocklist/components/SettingAccountsBlocklistContactRow';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type SettingAccountsBlocklistContainerProps = {
  blocklist: BlocklistItem[];
};

export const SettingAccountsBlocklistContainer = ({
  blocklist,
}: SettingAccountsBlocklistContainerProps) => {
  return (
    <StyledContainer>
      <SettingsAccountsBlocklistContactRow />
      {blocklist.map((blocklistItem) => (
        <SettingsAccountsBlocklistContactRow
          key={blocklistItem.id}
          item={blocklistItem}
        />
      ))}
    </StyledContainer>
  );
};
