import { render } from '@testing-library/react';

import { NO_WIDGET_DASHBOARD_FILTER } from '@/page-layout/constants/NoWidgetDashboardFilter';
import { WidgetDashboardFilterContext } from '@/page-layout/contexts/WidgetDashboardFilterContext';
import { makeWidget } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { RecordTableWidgetRenderer } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRenderer';
import {
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const mockRecordTableWidgetRendererContent = jest.fn();

jest.mock('@/page-layout/hooks/useCurrentPageLayoutOrThrow', () => ({
  useCurrentPageLayoutOrThrow: () => ({
    currentPageLayout: { type: 'DASHBOARD' },
  }),
}));
jest.mock('@/page-layout/hooks/useIsPageLayoutInEditMode', () => ({
  useIsPageLayoutInEditMode: () => false,
}));
jest.mock(
  '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent',
  () => ({
    RecordTableWidgetRendererContent: (props: unknown) => {
      mockRecordTableWidgetRendererContent(props);

      return null;
    },
  }),
);

const WIDGET: PageLayoutWidget = {
  ...makeWidget('widget-id', 0),
  objectMetadataId: 'object-metadata-id',
  type: WidgetType.RECORD_TABLE,
  configuration: {
    __typename: 'RecordTableConfiguration' as const,
    configurationType: WidgetConfigurationType.RECORD_TABLE,
    viewId: 'view-id',
  },
};

const DASHBOARD_GQL_OPERATION_FILTER = {
  closeDate: { gte: '2026-08-14T00:00:00Z' },
};

describe('RecordTableWidgetRenderer', () => {
  it('should hand the table the dashboard filter and the view filters it replaces', () => {
    render(
      <WidgetDashboardFilterContext.Provider
        value={{
          ...NO_WIDGET_DASHBOARD_FILTER,
          gqlOperationFilter: DASHBOARD_GQL_OPERATION_FILTER,
          replacedWidgetRecordFilterIds: ['this-quarter-view-filter'],
        }}
      >
        <RecordTableWidgetRenderer widget={WIDGET} />
      </WidgetDashboardFilterContext.Provider>,
    );

    expect(mockRecordTableWidgetRendererContent).toHaveBeenCalledWith(
      expect.objectContaining({
        viewId: 'view-id',
        additionalFilter: DASHBOARD_GQL_OPERATION_FILTER,
        excludedRecordFilterIds: ['this-quarter-view-filter'],
      }),
    );
  });
});
