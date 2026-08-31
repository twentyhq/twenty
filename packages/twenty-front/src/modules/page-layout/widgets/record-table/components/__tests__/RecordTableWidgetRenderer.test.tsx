import { makeWidget } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { RecordTableWidgetRenderer } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRenderer';
import { render } from '@testing-library/react';
import {
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const mockRecordTableWidgetRendererContent = jest.fn(
  (_props: Record<string, unknown>) => null,
);

jest.mock('@/page-layout/hooks/useCurrentPageLayoutOrThrow', () => ({
  useCurrentPageLayoutOrThrow: () => ({
    currentPageLayout: { type: PageLayoutType.DASHBOARD },
  }),
}));

jest.mock('@/page-layout/hooks/useIsPageLayoutInEditMode', () => ({
  useIsPageLayoutInEditMode: () => false,
}));

jest.mock(
  '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent',
  () => ({
    RecordTableWidgetRendererContent: (props: Record<string, unknown>) =>
      mockRecordTableWidgetRendererContent(props),
  }),
);

jest.mock('@/page-layout/widgets/components/WidgetContentFrame', () => ({
  StyledWidgetTableOutline: ({ children }: { children: React.ReactNode }) =>
    children,
}));

const getRecordTableWidget = (viewerControls?: {
  filter?: boolean;
  sort?: boolean;
}): PageLayoutWidget =>
  ({
    ...makeWidget('widget-id', 0),
    type: WidgetType.RECORD_TABLE,
    objectMetadataId: 'object-metadata-id',
    configuration: {
      __typename: 'RecordTableConfiguration',
      configurationType: WidgetConfigurationType.RECORD_TABLE,
      viewId: 'view-id',
      viewerControls,
    },
  }) as PageLayoutWidget;

describe('RecordTableWidgetRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes the configured viewer controls to the rendered widget', () => {
    render(
      <RecordTableWidgetRenderer
        widget={getRecordTableWidget({
          filter: true,
          sort: false,
        })}
      />,
    );

    expect(mockRecordTableWidgetRendererContent).toHaveBeenCalledWith(
      expect.objectContaining({
        viewerControls: {
          filter: true,
          sort: false,
        },
      }),
    );
  });

  it('defaults omitted viewer controls to hidden', () => {
    render(<RecordTableWidgetRenderer widget={getRecordTableWidget()} />);

    expect(mockRecordTableWidgetRendererContent).toHaveBeenCalledWith(
      expect.objectContaining({
        viewerControls: undefined,
      }),
    );
  });
});
