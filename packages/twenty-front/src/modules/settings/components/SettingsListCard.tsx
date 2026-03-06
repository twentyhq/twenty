import { styled } from '@linaria/react';
import { type ComponentType, useContext } from 'react';

import { SettingsListSkeletonCard } from '@/settings/components/SettingsListSkeletonCard';

import { type IconComponent, IconPlus } from 'twenty-ui/display';
import { Card, CardFooter } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { SettingsListItemCardContent } from './SettingsListItemCardContent';

const StyledFooterContainer = styled.div`
  > * {
    align-items: center;
    display: flex;
    padding: ${themeCssVariables.spacing[1]};
  }
`;

const StyledButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex: 1 0 0;
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[8]};
  padding: 0 ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[2]};
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
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
  const { theme } = useContext(ThemeContext);

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
        <StyledFooterContainer>
          <CardFooter divider={!!items.length}>
            <StyledButton onClick={onFooterButtonClick}>
              <IconPlus size={theme.icon.size.md} />
              {footerButtonLabel}
            </StyledButton>
          </CardFooter>
        </StyledFooterContainer>
      )}
    </Card>
  );
};
