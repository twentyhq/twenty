import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

import { useSidePanelExpandTarget } from '@/side-panel/hooks/useSidePanelExpandTarget';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const mockAskAiExpandTarget: SidePanelExpandTarget = {
  label: 'Expand chat',
  hasExpandShortcut: true,
  expand: jest.fn(),
};

const mockRecordExpandTarget: SidePanelExpandTarget = {
  label: 'Expand record',
  hasExpandShortcut: true,
  expand: jest.fn(),
};

const mockRecordsExpandTarget: SidePanelExpandTarget = {
  label: 'Expand view',
  hasExpandShortcut: true,
  expand: jest.fn(),
};

const mockRichTextExpandTarget: SidePanelExpandTarget = {
  label: 'Expand record',
  hasExpandShortcut: true,
  expand: jest.fn(),
};

let mockHasSidePanelSubPages = false;
let mockIsMobile = false;

jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => mockIsMobile,
}));

jest.mock(
  '@/side-panel/pages/ask-ai/hooks/useExpandAskAiSidePanelPage',
  () => ({
    useExpandAskAiSidePanelPage: () => mockAskAiExpandTarget,
  }),
);

jest.mock(
  '@/side-panel/pages/record-page/hooks/useExpandRecordSidePanelPage',
  () => ({
    useExpandRecordSidePanelPage: () => mockRecordExpandTarget,
  }),
);

jest.mock(
  '@/side-panel/pages/records-page/hooks/useExpandRecordsSidePanelPage',
  () => ({
    useExpandRecordsSidePanelPage: () => mockRecordsExpandTarget,
  }),
);

jest.mock(
  '@/side-panel/pages/rich-text-page/hooks/useExpandRichTextSidePanelPage',
  () => ({
    useExpandRichTextSidePanelPage: () => mockRichTextExpandTarget,
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
    mockIsMobile = false;
    jest.clearAllMocks();
  });

  it('should return the ask ai target when the ask ai page is open', () => {
    const { result } = renderExpandTarget(SidePanelPages.AskAI);

    expect(result.current).toBe(mockAskAiExpandTarget);
  });

  it('should return the record target when a record page is open', () => {
    const { result } = renderExpandTarget(SidePanelPages.ViewRecord);

    expect(result.current).toBe(mockRecordExpandTarget);
  });

  it('should return the records target when a records page is open', () => {
    const { result } = renderExpandTarget(SidePanelPages.ViewRecords);

    expect(result.current).toBe(mockRecordsExpandTarget);
  });

  it('should return the rich text target when a rich text page is open', () => {
    const { result } = renderExpandTarget(SidePanelPages.EditRichText);

    expect(result.current).toBe(mockRichTextExpandTarget);
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

  it('should return null on mobile where the panel already fills the viewport', () => {
    mockIsMobile = true;

    const { result } = renderExpandTarget(SidePanelPages.ViewRecord);

    expect(result.current).toBeNull();
  });
});
