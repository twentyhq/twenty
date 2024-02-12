import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { MessageChannel } from '@/accounts/types/MessageChannel';
import { SettingsAccountsInboxSettingsCardMedia } from '@/settings/accounts/components/SettingsAccountsInboxSettingsCardMedia';
import { IconSend } from '@/ui/display/icon';
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

type SettingsAccountsInboxSettingsContactAutoCreateSectionProps = {
  messageChannel: MessageChannel;
  onToggle: (value: boolean) => void;
};

export const SettingsAccountsInboxSettingsContactAutoCreateSection = ({
  messageChannel,
  onToggle,
}: SettingsAccountsInboxSettingsContactAutoCreateSectionProps) => {
  const theme = useTheme();

  return (
    <Section>
      <H2Title
        title="Contact auto-creation"
        description="Automatically create contacts for people you’ve sent emails to"
      />
      <Card>
        <StyledCardContent>
          <SettingsAccountsInboxSettingsCardMedia>
            <IconSend size={theme.icon.size.sm} stroke={theme.icon.stroke.lg} />
          </SettingsAccountsInboxSettingsCardMedia>
          <StyledTitle>Auto-creation</StyledTitle>
          <Toggle
            value={messageChannel.isContactAutoCreationEnabled}
            onChange={onToggle}
          />
        </StyledCardContent>
      </Card>
    </Section>
  );
};
