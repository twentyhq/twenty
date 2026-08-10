import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

import { useSidePanelExpandTarget } from '@/side-panel/hooks/useSidePanelExpandTarget';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const askAiExpandTarget: SidePanelExpandTarget = {
  label: 'Expand chat',
  expand: jest.fn(),
};

const recordExpandTarget: SidePanelExpandTarget = {
  label: 'Expand record',
  expand: jest.fn(),
};

const recordsExpandTarget: SidePanelExpandTarget = {
  label: 'Expand view',
  expand: jest.fn(),
};

let mockHasSidePanelSubPages = false;

jest.mock(
  '@/side-panel/pages/ask-ai/hooks/useExpandAskAiSidePanelPage',
  () => ({
    useExpandAskAiSidePanelPage: () => askAiExpandTarget,
  }),
);

jest.mock(
  '@/side-panel/pages/record-page/hooks/useExpandRecordSidePanelPage',
  () => ({
    useExpandRecordSidePanelPage: () => recordExpandTarget,
  }),
);

jest.mock(
  '@/side-panel/pages/records-page/hooks/useExpandRecordsSidePanelPage',
  () => ({
    useExpandRecordsSidePanelPage: () => recordsExpandTarget,
  }),
);

jest.mock('@/side-panel/hooks/useSidePanelSubPageHistory', () => ({
  useSidePanelSubPageHistory: () => ({
    hasSidePanelSubPages: mockHasSidePanelSubPages,
  }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderExpandTarget = (sidePanelPage: SidePanelPages) => {
  jotaiStore.set(sidePanelPageState.atom, sidePanelPage);

  return renderHook(() => useSidePanelExpandTarget(), { wrapper });
};

describe('useSidePanelExpandTarget', () => {
  beforeEach(() => {
    mockHasSidePanelSubPages = false;
    jest.clearAllMocks();
  });

  it('should return the ask ai target when the ask ai page is open', () => {
    const { result } = renderExpandTarget(SidePanelPages.AskAI);

    expect(result.current).toBe(askAiExpandTarget);
  });

  it('should return the record target when a record page is open', () => {
    const { result } = renderExpandTarget(SidePanelPages.ViewRecord);

    expect(result.current).toBe(recordExpandTarget);
  });

  it('should return the records target when a records page is open', () => {
    const { result } = renderExpandTarget(SidePanelPages.ViewRecords);

    expect(result.current).toBe(recordsExpandTarget);
  });

  it('should return null when the page has no full page equivalent', () => {
    const { result } = renderExpandTarget(SidePanelPages.SearchRecords);

    expect(result.current).toBeNull();
  });

  it('should return null when a sub page has taken over the panel', () => {
    mockHasSidePanelSubPages = true;

    const { result } = renderExpandTarget(SidePanelPages.ViewRecord);

    expect(result.current).toBeNull();
  });
});
