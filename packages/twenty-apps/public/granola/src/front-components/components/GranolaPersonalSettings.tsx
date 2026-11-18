import 'twenty-ui/style.css';

import { useState } from 'react';
import { t, useColorScheme } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Select } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { THEME_DARK, THEME_LIGHT, ThemeProvider } from 'twenty-ui/theme';

import { GranolaPersonalFolderSelection } from 'src/front-components/components/GranolaPersonalFolderSelection';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { fetchGranolaPersonalConnectionsOrThrow } from 'src/front-components/utils/fetch-granola-personal-connections-or-throw.util';

type GranolaConnectionsState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'loaded'; connections: { id: string; name: string }[] };

export const GranolaPersonalSettings = () => {
  const colorScheme = useColorScheme();
  const [state, setState] = useState<GranolaConnectionsState>({
    status: 'loading',
  });
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>();

  const loadConnections = async () => {
    setState({ status: 'loading' });

    try {
      const connections = await fetchGranolaPersonalConnectionsOrThrow();
      setState({ status: 'loaded', connections });
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
            'Choose which Granola folders to share with this workspace.',
          )}
        />
        <StyledSettingsSectionStack>
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
                      setSelectedConnectionId(value);
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
              />
            </>
          )}
        </StyledSettingsSectionStack>
      </Section.Root>
    </ThemeProvider>
  );
};
