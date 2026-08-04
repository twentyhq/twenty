import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { RecordTableWidgetViewDraftInitEffect } from '@/page-layout/widgets/record-table/components/RecordTableWidgetViewDraftInitEffect';
import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import { constructViewFromRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/constructViewFromRecordTableWidgetViewSnapshot';
import { render } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const PAGE_LAYOUT_ID = '20202020-f244-4ae0-906b-78958aa07642';
const WIDGET_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const VIEW_ID = '20202020-6d30-4d13-b1a0-9ba1f4e0b1a2';

const view = constructViewFromRecordTableWidgetViewSnapshot(
  buildRecordTableWidgetViewSnapshot(
    getMockObjectMetadataItemOrThrow('company'),
  ),
);

jest.mock('@/views/hooks/useViewById', () => ({
  useViewById: () => ({ view }),
}));

describe('RecordTableWidgetViewDraftInitEffect', () => {
  it('should seed the draft without a page layout provider tree, as in the widget settings side panel', () => {
    const store = createStore();

    render(
      <JotaiProvider store={store}>
        <RecordTableWidgetViewDraftInitEffect
          widgetId={WIDGET_ID}
          viewId={VIEW_ID}
          pageLayoutId={PAGE_LAYOUT_ID}
          isPageLayoutInEditMode
        />
      </JotaiProvider>,
    );

    const draft = store.get(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
    );

    expect(draft[WIDGET_ID]).toBeDefined();
  });

  it('should not seed the draft when the page layout is not in edit mode', () => {
    const store = createStore();

    render(
      <JotaiProvider store={store}>
        <RecordTableWidgetViewDraftInitEffect
          widgetId={WIDGET_ID}
          viewId={VIEW_ID}
          pageLayoutId={PAGE_LAYOUT_ID}
          isPageLayoutInEditMode={false}
        />
      </JotaiProvider>,
    );

    const draft = store.get(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
    );

    expect(draft[WIDGET_ID]).toBeUndefined();
  });
});
