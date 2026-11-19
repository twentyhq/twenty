import { createStore } from 'jotai';
import { type ConditionalAvailabilityNode } from 'twenty-shared/types';

import { conditionalAvailabilityEditorEntriesState } from '@/conditional-availability/states/conditionalAvailabilityEditorEntriesState';
import { type ConditionalAvailabilityEditorEntry } from '@/conditional-availability/types/ConditionalAvailabilityEditorEntry';
import { activeCustomizationPageLayoutIdsState } from '@/layout-customization/states/activeCustomizationPageLayoutIdsState';
import { hasIncompleteLayoutCustomizationConditionalAvailabilityDraftSelector } from '@/layout-customization/states/hasIncompleteLayoutCustomizationConditionalAvailabilityDraftSelector';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';

const RECORD_PAGE_LAYOUT_ID = 'record-page-layout';
const DASHBOARD_PAGE_LAYOUT_ID = 'dashboard-page-layout';
const STORED_NODE: ConditionalAvailabilityNode = {
  type: 'COMPARISON',
  operator: 'EQUAL',
  left: { type: 'PATH', path: 'device' },
  right: { type: 'LITERAL', value: 'MOBILE' },
};

const buildIncompleteEntry = (
  node: ConditionalAvailabilityNode | null,
): ConditionalAvailabilityEditorEntry => ({
  metadataName: 'pageLayoutWidget',
  storedNode: node,
  editorState: {
    mode: 'customRule',
    tree: {
      logicalOperator: 'AND',
      children: [
        {
          type: 'row',
          row: { id: 'row-1', subject: 'device', operator: 'is', values: [] },
        },
      ],
    },
  },
});

const buildStore = () => {
  const store = createStore();

  store.set(
    pageLayoutDraftComponentState.atomFamily({
      instanceId: RECORD_PAGE_LAYOUT_ID,
    }),
    {
      ...makeDraft([
        makeTab('tab-1', [
          {
            ...makeWidget('widget-1', 0),
            conditionalAvailability: STORED_NODE,
          },
        ]),
        makeTab(
          'inactive-tab',
          [makeWidget('inactive-tab-widget', 0, 'inactive-tab')],
          1,
          undefined,
          { isActive: false },
        ),
      ]),
      id: RECORD_PAGE_LAYOUT_ID,
    },
  );
  store.set(
    pageLayoutDraftComponentState.atomFamily({
      instanceId: DASHBOARD_PAGE_LAYOUT_ID,
    }),
    {
      ...makeDraft([
        makeTab('dashboard-tab', [makeWidget('dashboard-widget-1', 0)]),
      ]),
      id: DASHBOARD_PAGE_LAYOUT_ID,
    },
  );
  store.set(activeCustomizationPageLayoutIdsState.atom, [
    RECORD_PAGE_LAYOUT_ID,
  ]);

  return store;
};

const isIncomplete = (
  editorEntries: Record<string, ConditionalAvailabilityEditorEntry>,
) => {
  const store = buildStore();

  store.set(conditionalAvailabilityEditorEntriesState.atom, editorEntries);

  return store.get(
    hasIncompleteLayoutCustomizationConditionalAvailabilityDraftSelector.atom,
  );
};

describe('hasIncompleteLayoutCustomizationConditionalAvailabilityDraftSelector', () => {
  it('counts an unfinished rule of a widget on the page being customized', () => {
    expect(
      isIncomplete({
        'pageLayoutWidget:widget-1': buildIncompleteEntry(STORED_NODE),
      }),
    ).toBe(true);
  });

  it('ignores a finished rule of a widget on the page being customized', () => {
    expect(
      isIncomplete({
        'pageLayoutWidget:widget-1': {
          metadataName: 'pageLayoutWidget',
          storedNode: STORED_NODE,
          editorState: { mode: 'everyone' },
        },
      }),
    ).toBe(false);
  });

  it('ignores an unfinished rule of a widget no longer in the draft', () => {
    expect(
      isIncomplete({
        'pageLayoutWidget:removed-widget': buildIncompleteEntry(null),
      }),
    ).toBe(false);
  });

  it('ignores an unfinished rule of a widget in an inactive tab', () => {
    expect(
      isIncomplete({
        'pageLayoutWidget:inactive-tab-widget': buildIncompleteEntry(null),
      }),
    ).toBe(false);
  });

  it('ignores an unfinished rule of a page layout that is not being customized', () => {
    expect(
      isIncomplete({
        'pageLayoutWidget:dashboard-widget-1': buildIncompleteEntry(null),
      }),
    ).toBe(false);
  });

  it('ignores an unfinished rule whose stored rule changed since it was opened', () => {
    expect(
      isIncomplete({
        'pageLayoutWidget:widget-1': buildIncompleteEntry(null),
      }),
    ).toBe(false);
  });
});
