import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { LogConsolePageContainer } from '@/log-console/components/LogConsolePageContainer';
import { LogConsoleWebhookForm } from '@/log-console/components/LogConsoleWebhookForm';
import { logConsoleWebhooksViewState } from '@/log-console/states/logConsoleWebhooksViewState';
import { SettingsWebhooksTable } from '@/settings/developers/components/SettingsWebhooksTable';
import { WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const LogConsoleWebhooks = () => {
  const { t } = useLingui();
  const [logConsoleWebhooksView, setLogConsoleWebhooksView] = useAtomState(
    logConsoleWebhooksViewState,
  );

  switch (logConsoleWebhooksView.type) {
    case 'new':
      return <LogConsoleWebhookForm mode={WebhookFormMode.Create} />;
    case 'detail':
      return (
        <LogConsoleWebhookForm
          key={logConsoleWebhooksView.id}
          mode={WebhookFormMode.Edit}
          webhookId={logConsoleWebhooksView.id}
        />
      );
    case 'list':
      return (
        <LogConsolePageContainer scrollWrapperInstanceId="log-console-webhooks">
          <Section.Root>
            <Section.Header
              title={t`Webhooks`}
              description={t`Establish Webhook endpoints for notifications on asynchronous events.`}
            />
            <SettingsWebhooksTable
              onWebhookClick={(webhookId) =>
                setLogConsoleWebhooksView({ type: 'detail', id: webhookId })
              }
            />
            <StyledButtonContainer>
              <Button
                startIcon={<IconPlus />}
                size="sm"
                variant="outline"
                onClick={() => setLogConsoleWebhooksView({ type: 'new' })}
              >{t`Create webhook`}</Button>
            </StyledButtonContainer>
          </Section.Root>
        </LogConsolePageContainer>
      );
  }
};
