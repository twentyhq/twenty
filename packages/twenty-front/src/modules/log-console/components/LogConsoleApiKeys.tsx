import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { LogConsoleApiKeyDetail } from '@/log-console/components/LogConsoleApiKeyDetail';
import { LogConsoleApiKeyNew } from '@/log-console/components/LogConsoleApiKeyNew';
import { LogConsolePageContainer } from '@/log-console/components/LogConsolePageContainer';
import { logConsoleApiKeysViewState } from '@/log-console/states/logConsoleApiKeysViewState';
import { SettingsApiKeysTable } from '@/settings/developers/components/SettingsApiKeysTable';
import { PlaygroundSetupForm } from '@/settings/mcp-and-apis/components/PlaygroundSetupForm';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const LogConsoleApiKeys = () => {
  const { t } = useLingui();
  const [logConsoleApiKeysView, setLogConsoleApiKeysView] = useAtomState(
    logConsoleApiKeysViewState,
  );

  switch (logConsoleApiKeysView.type) {
    case 'new':
      return <LogConsoleApiKeyNew />;
    case 'detail':
      return (
        <LogConsoleApiKeyDetail
          key={logConsoleApiKeysView.id}
          apiKeyId={logConsoleApiKeysView.id}
        />
      );
    case 'list':
      return (
        <LogConsolePageContainer scrollWrapperInstanceId="log-console-api-keys">
          <Section.Root>
            <Section.Header
              title={t`Documentation`}
              description={t`Try our REST or GraphQL API playgrounds`}
            />
            <PlaygroundSetupForm />
          </Section.Root>
          <Section.Root>
            <Section.Header
              title={t`API Keys`}
              description={t`Active API keys created by you or your team.`}
            />
            <SettingsApiKeysTable
              onApiKeyClick={(apiKeyId) =>
                setLogConsoleApiKeysView({ type: 'detail', id: apiKeyId })
              }
            />
            <StyledButtonContainer>
              <Button
                startIcon={<IconPlus />}
                size="sm"
                variant="outline"
                onClick={() => setLogConsoleApiKeysView({ type: 'new' })}
              >{t`Create API key`}</Button>
            </StyledButtonContainer>
          </Section.Root>
        </LogConsolePageContainer>
      );
  }
};
