import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { reorderTabInDraft } from '@/page-layout/utils/reorderTabInDraft';

const orderOf = (draft: DraftPageLayout) =>
  [...draft.tabs]
    .sort((tabA, tabB) => tabA.position - tabB.position)
    .map((tab) => tab.id);

describe('reorderTabInDraft', () => {
  it('moves a tab before another tab', () => {
    const draft = makeDraft([
      makeTab('tab-a', [], 0),
      makeTab('tab-b', [], 1),
      makeTab('tab-c', [], 2),
    ]);

    const result = reorderTabInDraft(draft, {
      tabId: 'tab-c',
      beforeTabId: 'tab-a',
    });

    expect(orderOf(result)).toEqual(['tab-c', 'tab-a', 'tab-b']);
  });

  it('moves a tab forward before a later tab, compensating for its removal', () => {
    const draft = makeDraft([
      makeTab('tab-a', [], 0),
      makeTab('tab-b', [], 1),
      makeTab('tab-c', [], 2),
    ]);

    const result = reorderTabInDraft(draft, {
      tabId: 'tab-a',
      beforeTabId: 'tab-c',
    });

    expect(orderOf(result)).toEqual(['tab-b', 'tab-a', 'tab-c']);
  });

  it('appends the tab at the end when beforeTabId is null', () => {
    const draft = makeDraft([
      makeTab('tab-a', [], 0),
      makeTab('tab-b', [], 1),
      makeTab('tab-c', [], 2),
    ]);

    const result = reorderTabInDraft(draft, {
      tabId: 'tab-a',
      beforeTabId: null,
    });

    expect(orderOf(result)).toEqual(['tab-b', 'tab-c', 'tab-a']);
  });

  it('keeps tabs that are not rendered in the tab list in place', () => {
    const draft = makeDraft([
      makeTab('pinned-tab', [], 0),
      makeTab('tab-a', [], 1),
      makeTab('tab-b', [], 2),
    ]);

    const result = reorderTabInDraft(draft, {
      tabId: 'tab-b',
      beforeTabId: 'tab-a',
    });

    expect(orderOf(result)).toEqual(['pinned-tab', 'tab-b', 'tab-a']);
  });

  it('ignores inactive tabs when computing positions', () => {
    const draft = makeDraft([
      makeTab('tab-a', [], 0),
      makeTab('tab-inactive', [], 1, undefined, { isActive: false }),
      makeTab('tab-b', [], 2),
    ]);

    const result = reorderTabInDraft(draft, {
      tabId: 'tab-b',
      beforeTabId: 'tab-a',
    });

    expect(result.tabs.find((tab) => tab.id === 'tab-inactive')?.position).toBe(
      1,
    );
    expect(result.tabs.find((tab) => tab.id === 'tab-b')?.position).toBe(0);
    expect(result.tabs.find((tab) => tab.id === 'tab-a')?.position).toBe(1);
  });

  it('returns the draft unchanged when the move is a no-op', () => {
    const draft = makeDraft([makeTab('tab-a', [], 0), makeTab('tab-b', [], 1)]);

    expect(
      reorderTabInDraft(draft, { tabId: 'tab-a', beforeTabId: 'tab-b' }),
    ).toBe(draft);
    expect(
      reorderTabInDraft(draft, { tabId: 'tab-a', beforeTabId: 'tab-a' }),
    ).toBe(draft);
    expect(
      reorderTabInDraft(draft, { tabId: 'missing', beforeTabId: null }),
    ).toBe(draft);
    expect(
      reorderTabInDraft(draft, { tabId: 'tab-a', beforeTabId: 'missing' }),
    ).toBe(draft);
  });
});
