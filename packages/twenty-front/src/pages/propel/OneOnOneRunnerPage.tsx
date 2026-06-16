import { Box, Button, Center, Loader, Stack, Text } from '@mantine/core';
import { IconRefresh, IconUsers } from 'twenty-ui/display';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PropelMantineProvider } from '@/propel/components/PropelMantineProvider';
import { HubView } from '@/propel/components/runner/HubView';
import { useOneOnOneHubData } from '@/propel/hooks/useOneOnOneHubData';

// The graduated 1:1 Runner hero (P3 hero #3). Rides Twenty's DefaultLayout (nav +
// top bar come from the router <Outlet/>); this page owns the header + the
// role-aware Weekly 1:1 Hub, and opens the per-lead Meeting Runner inline as a
// real Drawer — the whole reason it graduates out of the front-component sandbox
// (real Drawer/Modal/focus/keyboard-nav that the box forbade). Identity is
// server-derived from the session token by the /one-on-one/hub route; this page
// never sends an acting-user id.
export const OneOnOneRunnerPage = () => {
  const { payload, isLoading, loaded, reload } = useOneOnOneHubData();

  const subtitle =
    payload === null
      ? null
      : payload.tier === 'PLAYER_COACH'
        ? 'Your team and your own week, one page.'
        : payload.tier === 'MANAGER'
          ? 'Your team’s week at a glance — book, run, and review.'
          : 'Your week — your next 1:1 and the leads to walk.';

  return (
    <PropelMantineProvider>
      <PageContainer>
        <PageHeader title="Weekly 1:1" Icon={IconUsers} />

        <Box style={{ padding: '0 16px 24px', minHeight: 0 }}>
          {isLoading && payload === null ? (
            <Center h={320}>
              <Loader color="red" />
            </Center>
          ) : payload !== null ? (
            <Stack gap="lg">
              {subtitle !== null ? (
                <Text size="sm" c="dimmed">
                  {subtitle}
                </Text>
              ) : null}
              <HubView payload={payload} onMutated={reload} />
            </Stack>
          ) : loaded ? (
            <Center h={320}>
              <Stack gap="md" align="center">
                <Text size="sm" c="dimmed">
                  Couldn’t load your 1:1 week.
                </Text>
                <Button
                  variant="default"
                  leftSection={<IconRefresh size={14} />}
                  onClick={reload}
                >
                  Retry
                </Button>
              </Stack>
            </Center>
          ) : null}
        </Box>
      </PageContainer>
    </PropelMantineProvider>
  );
};
