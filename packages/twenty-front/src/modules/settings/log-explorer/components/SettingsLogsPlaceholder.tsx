import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { TintedIconTile } from 'twenty-ui/components';
import { type IconComponent } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';

const StyledDescription = styled(EmptyState.Description)`
  max-height: none;
`;

type SettingsLogsPlaceholderProps = {
  Icon: IconComponent;
  title: string;
  description: string;
  actions?: ReactNode;
};

export const SettingsLogsPlaceholder = ({
  Icon,
  title,
  description,
  actions,
}: SettingsLogsPlaceholderProps) => {
  const theme = useTheme();

  return (
    <EmptyState.Root>
      <TintedIconTile Icon={Icon} size={theme.icon.size.xl} />
      <EmptyState.Content>
        <EmptyState.Title>{title}</EmptyState.Title>
        <StyledDescription>{description}</StyledDescription>
      </EmptyState.Content>
      {actions}
    </EmptyState.Root>
  );
};
