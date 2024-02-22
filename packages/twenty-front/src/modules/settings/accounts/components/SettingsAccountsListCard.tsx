import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SettingsAccountsListSkeletonCard } from '@/settings/accounts/components/SettingsAccountsListSkeletonCard';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { IconAt, IconPlus } from '@/ui/display/icon';
import { IconGoogle } from '@/ui/display/icon/components/IconGoogle';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
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

type SettingsAccountsListCardProps<
  Account extends Pick<ConnectedAccount, 'handle' | 'id'>,
> = {
  accounts: Account[];
  hasFooter?: boolean;
  isLoading?: boolean;
  onRowClick?: (account: Account) => void;
  RowIcon?: IconComponent;
  RowRightComponent: ({ account }: { account: Account }) => ReactNode;
};

export const SettingsAccountsListCard = <
  Account extends Pick<ConnectedAccount, 'handle' | 'id'> = ConnectedAccount,
>({
  accounts,
  hasFooter,
  isLoading,
  onRowClick,
  RowIcon = IconGoogle,
  RowRightComponent,
}: SettingsAccountsListCardProps<Account>) => {
  const theme = useTheme();
  const navigate = useNavigate();

  if (isLoading) return <SettingsAccountsListSkeletonCard />;

  if (!accounts.length) return <SettingsAccountsListEmptyStateCard />;

  return (
    <Card>
      {accounts.map((account, index) => (
        <SettingsAccountRow
          key={account.id}
          LeftIcon={RowIcon}
          account={account}
          rightComponent={<RowRightComponent account={account} />}
          divider={index < accounts.length - 1}
          onClick={() => onRowClick?.(account)}
        />
      ))}
      {hasFooter && (
        <StyledFooter>
          <IconAt size={theme.icon.size.sm} />
          Add account
          <StyledIconButton
            Icon={IconPlus}
            accent="tertiary"
            onClick={() =>
              navigate(getSettingsPagePath(SettingsPath.NewAccount))
            }
          />
        </StyledFooter>
      )}
    </Card>
  );
};
