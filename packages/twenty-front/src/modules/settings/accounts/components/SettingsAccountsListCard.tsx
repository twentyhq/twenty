import { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SettingsAccountsListSkeletonCard } from '@/settings/accounts/components/SettingsAccountsListSkeletonCard';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { IconPlus } from '@/ui/display/icon';
import { IconGoogle } from '@/ui/display/icon/components/IconGoogle';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { Card } from '@/ui/layout/card/components/Card';
import { CardFooter } from '@/ui/layout/card/components/CardFooter';

import { SettingsAccountRow } from './SettingsAccountsRow';

const StyledFooter = styled(CardFooter)`
  align-items: center;
  display: flex;
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledButton = styled.button`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: 0 ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;
  display: flex;
  flex: 1 0 0;
  height: ${({ theme }) => theme.spacing(8)};
  width: 100%;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

type SettingsAccountsListCardItem = {
  handle: string;
  id: string;
};

type SettingsAccountsListCardProps<T extends SettingsAccountsListCardItem> = {
  items: T[];
  hasFooter?: boolean;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  RowIcon?: IconComponent;
  RowRightComponent: ComponentType<{ item: T }>;
};

export const SettingsAccountsListCard = <
  T extends SettingsAccountsListCardItem,
>({
  items,
  hasFooter,
  isLoading,
  onRowClick,
  RowIcon = IconGoogle,
  RowRightComponent,
}: SettingsAccountsListCardProps<T>) => {
  const theme = useTheme();
  const navigate = useNavigate();

  if (isLoading === true) return <SettingsAccountsListSkeletonCard />;

  if (!items.length) return <SettingsAccountsListEmptyStateCard />;

  return (
    <Card>
      {items.map((item, index) => (
        <SettingsAccountRow
          key={item.id}
          LeftIcon={RowIcon}
          account={item}
          rightComponent={<RowRightComponent item={item} />}
          divider={index < items.length - 1}
          onClick={() => onRowClick?.(item)}
        />
      ))}
      {hasFooter && (
        <StyledFooter>
          <StyledButton
            onClick={() =>
              navigate(getSettingsPagePath(SettingsPath.NewAccount))
            }
          >
            <IconPlus size={theme.icon.size.md} />
            Add account
          </StyledButton>
        </StyledFooter>
      )}
    </Card>
  );
};
