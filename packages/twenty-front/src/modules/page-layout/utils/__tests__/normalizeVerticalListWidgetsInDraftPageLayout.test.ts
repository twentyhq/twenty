import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { isVerticalListPosition } from '@/page-layout/utils/isVerticalListPosition';
import { normalizeVerticalListWidgetsInDraftPageLayout } from '@/page-layout/utils/normalizeVerticalListWidgetsInDraftPageLayout';
import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutTabLayoutMode,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('normalizeVerticalListWidgetsInDraftPageLayout', () => {
  it('normalizes vertical-list widgets from their persisted positions', () => {
    const timelineWidget = {
      ...makeWidget('timeline', 0),
      type: WidgetType.TIMELINE,
    };
    const fieldsWidget = makeWidget('fields', 2);
    const fieldWidget = {
      ...makeWidget('field', 1),
      type: WidgetType.FIELD,
    };
    const draftPageLayout = makeDraft([
      makeTab('vertical-list-tab', [fieldsWidget, timelineWidget, fieldWidget]),
    ]);

    const normalizedDraft =
      normalizeVerticalListWidgetsInDraftPageLayout(draftPageLayout);

    expect(
      normalizedDraft.tabs[0].widgets.map((widget) => ({
        id: widget.id,
        position: widget.position,
      })),
    ).toEqual([
      {
        id: 'field',
        position: expect.objectContaining({ index: 0 }),
      },
      {
        id: 'fields',
        position: expect.objectContaining({ index: 1 }),
      },
      {
        id: 'timeline',
        position: expect.objectContaining({ index: 2 }),
      },
    ]);
  });

  it('does not modify the source draft', () => {
    const timelineWidget = {
      ...makeWidget('timeline', 0),
      type: WidgetType.TIMELINE,
    };
    const fieldsWidget = makeWidget('fields', 1);
    const draftPageLayout = makeDraft([
      makeTab('vertical-list-tab', [timelineWidget, fieldsWidget]),
    ]);

    normalizeVerticalListWidgetsInDraftPageLayout(draftPageLayout);

    expect(draftPageLayout.tabs[0].widgets.map((widget) => widget.id)).toEqual([
      'timeline',
      'fields',
    ]);
    expect(
      draftPageLayout.tabs[0].widgets.map((widget) =>
        isDefined(widget.position) && isVerticalListPosition(widget.position)
          ? widget.position.index
          : undefined,
      ),
    ).toEqual([0, 1]);
  });

  it('leaves grid widgets unchanged', () => {
    const firstWidget = makeWidget('first', 1);
    const secondWidget = makeWidget('second', 0);
    const gridTab = makeTab(
      'grid-tab',
      [firstWidget, secondWidget],
      0,
      PageLayoutTabLayoutMode.GRID,
    );

    const normalizedDraft = normalizeVerticalListWidgetsInDraftPageLayout(
      makeDraft([gridTab]),
    );

    expect(normalizedDraft.tabs[0].widgets).toEqual([
      firstWidget,
      secondWidget,
    ]);
  });
});
