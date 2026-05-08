import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { MessageChannelType } from 'twenty-shared/types';
import { H2Title, IconCopy, IconMail } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Card, CardContent, Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};
`;

const StyledLeft = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledHandle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  white-space: nowrap;
`;

const StyledAddress = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-family: monospace;
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledArrow = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex-shrink: 0;
`;

export const SettingsAccountsEmailForwardingSection = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const { channels } = useMyMessageChannels();

  const forwardingChannels = channels.filter(
    (channel) => channel.type === MessageChannelType.EMAIL_FORWARDING,
  );

  if (forwardingChannels.length === 0) {
    return null;
  }

  return (
    <Section>
      <H2Title
        title={t`Email Forwarding`}
        description={t`Forward emails from these addresses to their corresponding Twenty forwarding address.`}
      />
      <Card rounded>
        {forwardingChannels.map((channel) => {
          const sourceHandle =
            channel.connectedAccount?.handle ?? channel.handle;
          const forwardingAddress = channel.handle;

          return (
            <CardContent key={channel.id}>
              <StyledRow>
                <StyledLeft>
                  <IconMail size={16} />
                  <StyledHandle>{sourceHandle}</StyledHandle>
                  <StyledArrow>→</StyledArrow>
                  <StyledAddress>{forwardingAddress}</StyledAddress>
                </StyledLeft>
                <Button
                  Icon={IconCopy}
                  title={t`Copy`}
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    copyToClipboard(
                      forwardingAddress,
                      t`Forwarding address copied to clipboard`,
                    )
                  }
                />
              </StyledRow>
            </CardContent>
          );
        })}
      </Card>
    </Section>
  );
};
