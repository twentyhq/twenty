import 'twenty-ui/style.css';

import { useState } from 'react';
import { t, useColorScheme } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Select } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { THEME_DARK, THEME_LIGHT, ThemeProvider } from 'twenty-ui/theme';

import { GranolaFolderPolicyRadioCard } from 'src/front-components/components/GranolaFolderPolicyRadioCard';
import { GranolaPersonalFolderSelection } from 'src/front-components/components/GranolaPersonalFolderSelection';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { type GranolaPersonalFolders } from 'src/front-components/types/granola-personal-folders.type';
import { fetchGranolaPersonalConnectionsOrThrow } from 'src/front-components/utils/fetch-granola-personal-connections-or-throw.util';
import { getGranolaMemberFolderPolicyOptions } from 'src/front-components/utils/get-granola-member-folder-policy-options.util';

type GranolaConnectionsState =
  | { status: 'loading' }
  | { status: 'failed' }
  | {
      status: 'loaded';
      connections: { id: string; name: string }[];
      firstConnectionFolders: GranolaPersonalFolders | null;
    };

export const GranolaPersonalSettings = () => {
  const colorScheme = useColorScheme();
  const [state, setState] = useState<GranolaConnectionsState>({
    status: 'loading',
  });
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>();

  const loadConnections = async () => {
    setState({ status: 'loading' });

    try {
      const { connections, firstConnectionFolders } =
        await fetchGranolaPersonalConnectionsOrThrow();
      setState({ status: 'loaded', connections, firstConnectionFolders });
    } catch {
      setState({ status: 'failed' });
    }
  };

  const connections = state.status === 'loaded' ? state.connections : [];
  const connection =
    connections.find(({ id }) => id === selectedConnectionId) ?? connections[0];
  const connectionOptions = connections.map(({ id, name }) => ({
    value: id,
    label: name,
  }));
  const initialFolders =
    state.status === 'loaded' && connection?.id === connections[0]?.id
      ? (state.firstConnectionFolders ?? undefined)
      : undefined;

  const handleConnectionChange = (connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setState((current) =>
      current.status === 'loaded'
        ? { ...current, firstConnectionFolders: null }
        : current,
    );
  };

  return (
    <ThemeProvider
      colorScheme={colorScheme}
      theme={colorScheme === 'dark' ? THEME_DARK : THEME_LIGHT}
    >
      <OnMountEffect onMount={loadConnections} />
      <Section.Root>
        <Section.Header
          title={t('Folders')}
          description={t(
            'Notes from the folders you pick become Call Recordings that everyone in this workspace can see.',
          )}
        />
        <StyledSettingsSectionStack>
          {state.status === 'loading' && (
            <GranolaFolderPolicyRadioCard
              options={getGranolaMemberFolderPolicyOptions()}
              policy={undefined}
            />
          )}
          {state.status === 'failed' && (
            <InlineBanner
              layout="compact"
              status="error"
              action={
                <InlineBanner.Action onClick={loadConnections}>
                  {t('Retry')}
                </InlineBanner.Action>
              }
            >
              {t('Could not load your Granola connections.')}
            </InlineBanner>
          )}
          {state.status === 'loaded' && connections.length === 0 && (
            <Text size="sm" color="secondary">
              {t(
                'Add a personal Granola API key in the General tab to choose folders.',
              )}
            </Text>
          )}
          {isDefined(connection) && (
            <>
              {connectionOptions.length > 1 && (
                <Select.Root<string>
                  items={connectionOptions}
                  value={connection.id}
                  onValueChange={(value, details) => {
                    if (details.reason === 'item-press' && isDefined(value)) {
                      handleConnectionChange(value);
                    }
                  }}
                >
                  <Select.Trigger aria-label={t('Granola connection')}>
                    <Select.Value />
                    <Select.Icon />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Positioner alignItemWithTrigger={false}>
                      <Select.Popup>
                        {connectionOptions.map(({ value, label }) => (
                          <Select.Item key={value} value={value}>
                            <Select.ItemText>{label}</Select.ItemText>
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Popup>
                    </Select.Positioner>
                  </Select.Portal>
                </Select.Root>
              )}
              <GranolaPersonalFolderSelection
                key={connection.id}
                connectionId={connection.id}
                initialFolders={initialFolders}
              />
            </>
          )}
        </StyledSettingsSectionStack>
      </Section.Root>
    </ThemeProvider>
  );
};
