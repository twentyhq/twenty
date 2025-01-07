import { SettingsAccountsBlocklistContactRow } from '@/settings/accounts/components/SettingAccountBlocklistContactRow';
import { BlocklistContext } from '@/settings/accounts/contexts/BlocklistContext';
import styled from '@emotion/styled';
import { useContext } from 'react';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingAccountsBlocklistContainer = () => {
  const { blocklist } = useContext(BlocklistContext);
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
