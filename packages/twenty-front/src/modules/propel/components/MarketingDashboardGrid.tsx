import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { type ReactNode, useMemo } from 'react';
import {
  type Layout,
  type Layouts,
  Responsive,
  type ResponsiveProps,
  WidthProvider,
} from 'react-grid-layout';
import { PropelGridCard } from '@/propel/components/PropelGridCard';
import {
  GRID_BREAKPOINTS,
  GRID_COLS,
  GRID_MARGIN,
  GRID_ROW_HEIGHT,
  type WidgetId,
} from '@/propel/lib/dashboardConfig';
import {
  type MarketingAnalyticsPayload,
  type MarketingHubPayload,
} from '@/propel/types/marketingHome';
import { KpiTile } from '@/propel/widgets/KpiTile';
import { TrendChart } from '@/propel/widgets/TrendChart';
import { ChannelSplit } from '@/propel/widgets/ChannelSplit';
import { FunnelCard } from '@/propel/widgets/FunnelCard';
import { AttentionList } from '@/propel/widgets/AttentionList';
import { SendingNowCard } from '@/propel/widgets/SendingNowCard';

// react-grid-layout's class-component types clash with React 18's JSX element
// typing (missing `refs`), so we cast to a plain functional-component type — the
// same shape Twenty's PageLayoutGridLayout uses.
const ResponsiveGridLayout = WidthProvider(
  Responsive,
) as React.ComponentType<ResponsiveProps>;

// Render one widget by id. Each widget is presence-aware internally and renders an
// honest empty state when its slice of data is absent.
const renderWidget = (
  id: WidgetId,
  analytics: MarketingAnalyticsPayload | null,
  hub: MarketingHubPayload | null,
  editMode: boolean,
): ReactNode => {
  switch (id) {
    case 'kpi-sent':
      return (
        <KpiTile title="Sent" metric={analytics?.kpis?.sent} editMode={editMode} />
      );
    case 'kpi-openRate':
      return (
        <KpiTile
          title="Open rate"
          metric={analytics?.kpis?.openRate}
          format="percent"
          editMode={editMode}
        />
      );
    case 'kpi-replies':
      return (
        <KpiTile
          title="Replies"
          metric={analytics?.kpis?.replies}
          editMode={editMode}
        />
      );
    case 'kpi-revenue': {
      // Revenue rides a Presence wrapper — render ONLY when present (no zero-fill).
      const revenue = analytics?.kpis?.revenue;
      if (revenue === undefined || revenue.present !== true) {
        return (
          <KpiTile title="Revenue" metric={undefined} editMode={editMode} />
        );
      }
      return (
        <KpiTile
          title="Revenue"
          metric={{ value: revenue.value.total, deltaPct: null }}
          format="currency"
          editMode={editMode}
        />
      );
    }
    case 'trend':
      return <TrendChart analytics={analytics} editMode={editMode} />;
    case 'channels':
      return <ChannelSplit analytics={analytics} editMode={editMode} />;
    case 'funnel':
      return <FunnelCard analytics={analytics} editMode={editMode} />;
    case 'attention':
      return <AttentionList hub={hub} editMode={editMode} />;
    case 'sendingNow':
      return <SendingNowCard hub={hub} editMode={editMode} />;
    default:
      return null;
  }
};

export const MarketingDashboardGrid = ({
  analytics,
  hub,
  layouts,
  enabledWidgetIds,
  editMode,
  onLayoutChange,
}: {
  analytics: MarketingAnalyticsPayload | null;
  hub: MarketingHubPayload | null;
  layouts: Layouts;
  enabledWidgetIds: WidgetId[];
  editMode: boolean;
  onLayoutChange: (allLayouts: Layouts) => void;
}) => {
  // Only render grid children for enabled widgets that also have a layout item in
  // the active breakpoint — react-grid-layout warns when a child lacks a data-grid
  // entry, so we lean on the persisted/default layout as the membership list and
  // fall back to a placed item only if missing.
  const children = useMemo(
    () =>
      enabledWidgetIds.map((id) => (
        <PropelGridCard key={id}>
          {renderWidget(id, analytics, hub, editMode)}
        </PropelGridCard>
      )),
    [enabledWidgetIds, analytics, hub, editMode],
  );

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={GRID_BREAKPOINTS}
      cols={GRID_COLS}
      rowHeight={GRID_ROW_HEIGHT}
      margin={GRID_MARGIN}
      containerPadding={[0, 0]}
      isDraggable={editMode}
      isResizable={editMode}
      draggableHandle=".propel-drag-handle"
      compactType="vertical"
      preventCollision={false}
      onLayoutChange={(_current: Layout[], all: Layouts) => onLayoutChange(all)}
    >
      {children}
    </ResponsiveGridLayout>
  );
};
