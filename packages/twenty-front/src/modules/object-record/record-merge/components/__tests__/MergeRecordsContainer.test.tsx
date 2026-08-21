import { MergeRecordsContainer } from '@/object-record/record-merge/components/MergeRecordsContainer';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';

let mockActiveTabId = 'record-a';

jest.mock('@/object-record/record-merge/components/MergeRecordTab', () => ({
  MergeRecordTab: ({ recordId }: { recordId: string }) => (
    <div data-testid="merge-record-tab">{recordId}</div>
  ),
}));

jest.mock('@/object-record/record-merge/components/MergePreviewTab', () => ({
  MergePreviewTab: () => <div>Merge preview</div>,
}));

jest.mock('@/object-record/record-merge/components/MergeRecordsFooter', () => ({
  MergeRecordsFooter: () => null,
}));

jest.mock('@/object-record/record-merge/components/MergeSettingsTab', () => ({
  MergeSettingsTab: () => <div>Merge settings</div>,
}));

jest.mock(
  '@/object-record/record-merge/hooks/useMergeRecordsContainerTabs',
  () => ({
    useMergeRecordsContainerTabs: () => ({ tabs: [] }),
  }),
);

jest.mock(
  '@/object-record/record-merge/hooks/useMergeRecordsSelectedRecords',
  () => ({
    useMergeRecordsSelectedRecords: () => ({
      selectedRecords: [{ id: 'record-a' }, { id: 'record-b' }],
    }),
  }),
);

jest.mock('@/ui/layout/page/components/ShowPageContainer', () => ({
  ShowPageContainer: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock('@/ui/layout/side-panel/contexts/SidePanelContext', () => ({
  SidePanelProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock('@/ui/layout/tab-list/components/TabList', () => ({
  TabList: () => null,
}));

jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({
    useAvailableComponentInstanceIdOrThrow: () => 'merge-instance-id',
  }),
);

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => mockActiveTabId,
  }),
);

describe('MergeRecordsContainer', () => {
  beforeEach(() => {
    mockActiveTabId = 'record-a';
  });

  it('resets the scroll position when the merge tab changes', () => {
    const { rerender } = render(
      <MergeRecordsContainer objectNameSingular="company" />,
    );

    const contentContainer = screen.getByTestId('merge-record-tab')
      .parentElement as HTMLDivElement;

    contentContainer.scrollTop = 200;
    mockActiveTabId = 'record-b';

    rerender(<MergeRecordsContainer objectNameSingular="company" />);

    expect(screen.getByTestId('merge-record-tab')).toHaveTextContent(
      'record-b',
    );
    expect(contentContainer.scrollTop).toBe(0);
  });
});
