import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type ComponentType } from 'react';

import { SettingsListSkeletonCard } from '@/settings/components/SettingsListSkeletonCard';

import { type IconComponent, IconPlus } from 'twenty-ui/display';
import { Card, CardFooter } from 'twenty-ui/layout';
import { SettingsListItemCardContent } from './SettingsListItemCardContent';

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

type SettingsListCardProps<ListItem extends { id: string }> = {
  items: ListItem[];
  getItemLabel: (item: ListItem) => string;
  getItemDescription?: (item: ListItem) => string;
  hasFooter?: boolean;
  isLoading?: boolean;
  onRowClick?: (item: ListItem) => void;
  RowIcon?: IconComponent;
  RowIconFn?: (item: ListItem) => IconComponent;
  RowIconColor?: string;
  RowRightComponent: ComponentType<{ item: ListItem }>;
  footerButtonLabel?: string;
  onFooterButtonClick?: () => void;
  to?: (item: ListItem) => string;
  rounded?: boolean;
};

export const SettingsListCard = <
  ListItem extends { id: string } = {
    id: string;
  },
>({
  items,
  getItemLabel,
  getItemDescription,
  hasFooter,
  isLoading,
  onRowClick,
  RowIcon,
  RowIconFn,
  RowIconColor,
  RowRightComponent,
  onFooterButtonClick,
  footerButtonLabel,
  to,
  rounded,
}: SettingsListCardProps<ListItem>) => {
  const theme = useTheme();

  if (isLoading === true) return <SettingsListSkeletonCard />;

  return (
    <Card rounded={rounded}>
      {items.map((item, index) => (
        <SettingsListItemCardContent
          key={item.id}
          LeftIcon={RowIconFn ? RowIconFn(item) : RowIcon}
          LeftIconColor={RowIconColor}
          label={getItemLabel(item)}
          description={getItemDescription?.(item)}
          rightComponent={<RowRightComponent item={item} />}
          divider={index < items.length - 1}
          onClick={onRowClick ? () => onRowClick?.(item) : undefined}
          to={to?.(item)}
        />
      ))}
      {hasFooter && (
        <StyledFooter divider={!!items.length}>
          <StyledButton onClick={onFooterButtonClick}>
            <IconPlus size={theme.icon.size.md} />
            {footerButtonLabel}
          </StyledButton>
        </StyledFooter>
      )}
    </Card>
  );
};
