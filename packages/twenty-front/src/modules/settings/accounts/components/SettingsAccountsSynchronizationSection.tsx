import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { SettingsAccountsCardMedia } from '@/settings/accounts/components/SettingsAccountsCardMedia';
import { IconRefresh } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Toggle } from '@/ui/input/components/Toggle';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { Section } from '@/ui/layout/section/components/Section';

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

type SettingsAccountsSynchronizationSectionProps = {
  cardTitle: string;
  description: string;
  isSynced: boolean;
  onToggle: (value: boolean) => void;
};

export const SettingsAccountsSynchronizationSection = ({
  cardTitle,
  description,
  isSynced,
  onToggle,
}: SettingsAccountsSynchronizationSectionProps) => {
  const theme = useTheme();

  return (
    <Section>
      <H2Title title="Synchronization" description={description} />
      <Card>
        <StyledCardContent>
          <SettingsAccountsCardMedia>
            <IconRefresh
              size={theme.icon.size.sm}
              stroke={theme.icon.stroke.lg}
            />
          </SettingsAccountsCardMedia>
          <StyledTitle>{cardTitle}</StyledTitle>
          <Toggle value={isSynced} onChange={onToggle} />
        </StyledCardContent>
      </Card>
    </Section>
  );
};
