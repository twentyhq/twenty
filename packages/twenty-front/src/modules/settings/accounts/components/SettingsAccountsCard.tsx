import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { IconAt, IconPlus } from '@/ui/display/icon';
import { IconGoogle } from '@/ui/display/icon/components/IconGoogle';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Card } from '@/ui/layout/card/components/Card';
import { CardFooter } from '@/ui/layout/card/components/CardFooter';

import { SettingsAccountRow } from './SettingsAccountsRow';

const StyledFooter = styled(CardFooter)`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(4)};
`;

const StyledIconButton = styled(LightIconButton)`
  margin-left: auto;
`;

const StyledDropdown = styled(SettingsAccountsRowDropdownMenu)`
  margin-left: auto;
`;

type SettingsAccountsCardProps = {
  accounts: ConnectedAccount[];
  onAccountRemove?: (uuid: string) => void;
};

export const SettingsAccountsCard = ({
  accounts,
  onAccountRemove,
}: SettingsAccountsCardProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Card>
      {accounts.map((account, index) => (
        <SettingsAccountRow
          key={account.id}
          LeftIcon={IconGoogle}
          account={account}
          rightComponent={
            <StyledDropdown account={account} onRemove={onAccountRemove} />
          }
          divider={index < accounts.length - 1}
        />
      ))}
      <StyledFooter>
        <IconAt size={theme.icon.size.sm} />
        Add account
        <StyledIconButton
          Icon={IconPlus}
          accent="tertiary"
          onClick={() => navigate('/settings/accounts/new')}
        />
      </StyledFooter>
    </Card>
  );
};
