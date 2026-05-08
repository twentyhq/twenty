import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { z } from 'zod';

import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconCopy } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useCreateEmailGroupChannel } from '@/settings/accounts/hooks/useCreateEmailGroupChannel';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledAddressContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledAddress = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-family: monospace;
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledInstructions = styled.ol`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.6;
  margin: 0;
  padding-left: ${themeCssVariables.spacing[6]};
`;

export const SettingsAccountsNewEmailGroupChannel = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { copyToClipboard } = useCopyToClipboard();
  const { createEmailGroupChannel, loading } = useCreateEmailGroupChannel();

  const [handle, setHandle] = useState('');
  const [forwardingAddress, setForwardingAddress] = useState<string | null>(
    null,
  );

  const isHandleValidEmail = z.email().safeParse(handle).success;
  const canSave = isHandleValidEmail && !loading && !forwardingAddress;

  const handleSave = useCallback(async () => {
    try {
      const result = await createEmailGroupChannel(handle);

      const address = result.data?.createEmailGroupChannel.forwardingAddress;

      if (address) {
        setForwardingAddress(address);
      }
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to create email group channel. Email forwarding may not be configured on this server.`,
      });
    }
  }, [createEmailGroupChannel, handle, enqueueErrorSnackBar, t]);

  return (
    <SubMenuTopBarContainer
      title={t`New Email Group`}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: t`Accounts`,
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: t`New Email Group` },
      ]}
      actionButton={
        !forwardingAddress ? (
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            isCancelDisabled={loading}
            isLoading={loading}
            onCancel={() => navigate(SettingsPath.Accounts)}
            onSave={handleSave}
          />
        ) : undefined
      }
    >
      <SettingsPageContainer>
        {!forwardingAddress ? (
          <Section>
            <H2Title
              title={t`Email Address`}
              description={t`Enter the email address you want to forward emails from (e.g. support@mycompany.com).`}
            />
            <SettingsTextInput
              instanceId="email-group-handle"
              label={t`Source Email Address`}
              placeholder="support@mycompany.com"
              value={handle}
              onChange={setHandle}
              disabled={loading}
            />
          </Section>
        ) : (
          <Section>
            <H2Title
              title={t`Forwarding Address Created`}
              description={t`Set up forwarding from ${handle} to this address. Emails will automatically appear in Twenty.`}
            />
            <StyledAddressContainer>
              <StyledAddress>{forwardingAddress}</StyledAddress>
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
            </StyledAddressContainer>
            <StyledInstructions>
              <li>{t`Copy the forwarding address above`}</li>
              <li>{t`Add it as a member of your Google Group or Microsoft 365 shared mailbox, or set up email forwarding in your email provider`}</li>
              <li>{t`Emails sent to ${handle} will automatically appear in Twenty`}</li>
            </StyledInstructions>
          </Section>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
