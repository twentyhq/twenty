import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { SettingsAccountsCardMedia } from '@/settings/accounts/components/SettingsAccountsCardMedia';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { Toggle } from '@/ui/input/components/Toggle';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';

type SettingsAccountsToggleSettingCardProps = {
  Icon: IconComponent;
  isEnabled: boolean;
  onToggle: (value: boolean) => void;
  title: string;
};

const StyledCardContent = styled(CardContent)`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(2, 4)};
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-right: auto;
`;

export const SettingsAccountsToggleSettingCard = ({
  Icon,
  isEnabled,
  onToggle,
  title,
}: SettingsAccountsToggleSettingCardProps) => {
  const theme = useTheme();

  return (
    <Card>
      <StyledCardContent>
        <SettingsAccountsCardMedia>
          <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.lg} />
        </SettingsAccountsCardMedia>
        <StyledTitle>{title}</StyledTitle>
        <Toggle value={isEnabled} onChange={onToggle} />
      </StyledCardContent>
    </Card>
  );
};
