import { Button, Center, Group, Loader, SegmentedControl } from '@mantine/core';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Layouts } from 'react-grid-layout';
import { AppPath } from 'twenty-shared/types';
import {
  IconBroadcast,
  IconCheck,
  IconPencil,
  IconPlus,
} from 'twenty-ui/display';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PropelMantineProvider } from '@/propel/components/PropelMantineProvider';
import { MarketingDashboardGrid } from '@/propel/components/MarketingDashboardGrid';
import { useMarketingDashboardData } from '@/propel/hooks/useMarketingDashboardData';
import { type AnalyticsRange } from '@/propel/types/marketingHome';

// The graduated Marketing Home dashboard (P3 hero #1). Rides Twenty's DefaultLayout
// (the nav sidebar + top bar come from the router <Outlet/>); this page owns only
// the page header + the customizable widget grid, wrapped in its own Mantine scope.
export const MarketingHomePage = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [editMode, setEditMode] = useState(false);

  const {
    analytics,
    hub,
    layouts,
    setLayouts,
    enabledWidgetIds,
    isLoading,
    layoutLoaded,
    persistLayout,
  } = useMarketingDashboardData(range);

  const handleLayoutChange = useCallback(
    (allLayouts: Layouts) => {
      // Only track changes once the persisted layout has loaded, so the initial
      // breakpoint-derivation passes don't clobber a user's saved arrangement.
      if (layoutLoaded) {
        setLayouts(allLayouts);
      }
    },
    [layoutLoaded, setLayouts],
  );

  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => {
      const next = !prev;
      // Leaving edit mode ("Done") persists the current arrangement.
      if (prev && !next) {
        persistLayout(layouts, enabledWidgetIds);
      }
      return next;
    });
  }, [layouts, enabledWidgetIds, persistLayout]);

  const greeting = hub?.greeting;

  return (
    <PropelMantineProvider>
      <PageContainer>
        <PageHeader
          title={greeting != null && greeting !== '' ? greeting : 'Marketing'}
          Icon={IconBroadcast}
        >
          <Group gap="sm" wrap="nowrap">
            <Button
              size="xs"
              color="red"
              leftSection={<IconPlus size={14} />}
              onClick={() => navigate(AppPath.MarketingCampaignBuilder)}
            >
              New campaign
            </Button>
            <SegmentedControl
              size="xs"
              value={range}
              onChange={(value) => setRange(value as AnalyticsRange)}
              data={[
                { label: '7d', value: '7d' },
                { label: '30d', value: '30d' },
                { label: '90d', value: '90d' },
              ]}
            />
            <Button
              size="xs"
              variant={editMode ? 'filled' : 'default'}
              color={editMode ? 'red' : undefined}
              leftSection={
                editMode ? <IconCheck size={14} /> : <IconPencil size={14} />
              }
              onClick={toggleEditMode}
            >
              {editMode ? 'Done' : 'Customize'}
            </Button>
          </Group>
        </PageHeader>

        <div style={{ padding: '0 16px 24px', minHeight: 0 }}>
          {isLoading && analytics === null ? (
            <Center h={320}>
              <Loader color="red" />
            </Center>
          ) : (
            <MarketingDashboardGrid
              analytics={analytics}
              hub={hub}
              layouts={layouts}
              enabledWidgetIds={enabledWidgetIds}
              editMode={editMode}
              onLayoutChange={handleLayoutChange}
            />
          )}
        </div>
      </PageContainer>
    </PropelMantineProvider>
  );
};
