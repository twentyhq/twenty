import { render, screen } from '@testing-library/react';
import type * as LayoutRenderingContextModule from '@/ui/layout/contexts/LayoutRenderingContext';

import { PageLayoutRecordPageRenderer } from '@/object-record/record-show/components/PageLayoutRecordPageRenderer';

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
  () => ({
    useAtomFamilySelectorValue: () => null,
  }),
);

jest.mock('@/page-layout/hooks/usePageLayoutIdForRecord', () => ({
  usePageLayoutIdForRecord: () => ({ pageLayoutId: 'record-layout-id' }),
}));

jest.mock('@/object-record/record-show/components/RecordShowEffect', () => ({
  RecordShowEffect: () => null,
}));

jest.mock(
  '@/object-record/record-show/components/RecordShowContainerContextStoreTargetedRecordsEffect',
  () => ({
    RecordShowContainerContextStoreTargetedRecordsEffect: () => null,
  }),
);

jest.mock('@/page-layout/components/PageLayoutRenderer', () => {
  const { useLayoutRenderingContext } = jest.requireActual(
    '@/ui/layout/contexts/LayoutRenderingContext',
  ) as typeof LayoutRenderingContextModule;

  return {
    PageLayoutRenderer: () => {
      const { isInSidePanel } = useLayoutRenderingContext();

      return (
        <div data-testid="layout-surface">
          {isInSidePanel ? 'side-panel' : 'main'}
        </div>
      );
    },
  };
});

jest.mock(
  '@/command-menu-item/components/RecordPageSidePanelCommandMenu',
  () => ({
    RecordPageSidePanelCommandMenu: () => <button>Options</button>,
  }),
);

jest.mock(
  '@/command-menu-item/components/RecordPageSidePanelWidgetCommandMenuItems',
  () => ({
    RecordPageSidePanelWidgetCommandMenuItems: () => <button>Widgets</button>,
  }),
);

jest.mock(
  '@/command-menu-item/components/RecordPageSidePanelPinnedCommandMenuItems',
  () => ({
    RecordPageSidePanelPinnedCommandMenuItems: () => <button>Pinned</button>,
  }),
);

const targetRecordIdentifier = {
  id: '11111111-1111-4111-8111-111111111111',
  targetObjectNameSingular: 'company',
};

describe('PageLayoutRecordPageRenderer', () => {
  it('keeps the native record side-panel surface and its bottom commands', () => {
    render(
      <PageLayoutRecordPageRenderer
        targetRecordIdentifier={targetRecordIdentifier}
        isInSidePanel
      />,
    );

    expect(screen.getByTestId('layout-surface')).toHaveTextContent(
      'side-panel',
    );
    expect(screen.getByRole('button', { name: 'Options' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Widgets' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Pinned' })).toBeVisible();
  });

  it('does not render side-panel commands on the full record page', () => {
    render(
      <PageLayoutRecordPageRenderer
        targetRecordIdentifier={targetRecordIdentifier}
        isInSidePanel={false}
      />,
    );

    expect(screen.getByTestId('layout-surface')).toHaveTextContent('main');
    expect(screen.queryByRole('button', { name: 'Options' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Widgets' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Pinned' })).toBeNull();
  });
});
