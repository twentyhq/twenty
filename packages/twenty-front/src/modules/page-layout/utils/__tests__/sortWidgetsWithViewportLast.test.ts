import { makeWidget } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { sortWidgetsWithViewportLast } from '@/page-layout/utils/sortWidgetsWithViewportLast';
import { WidgetType } from '~/generated-metadata/graphql';

const makeWidgetWithType = (
  id: string,
  index: number,
  type: WidgetType,
): PageLayoutWidget => ({
  ...makeWidget(id, index),
  type,
});

describe('sortWidgetsWithViewportLast', () => {
  it('normalizes a viewport widget after expandable widgets during edits', () => {
    const timelineWidget = makeWidgetWithType(
      'timeline',
      0,
      WidgetType.TIMELINE,
    );
    const fieldsWidget = makeWidgetWithType('fields', 1, WidgetType.FIELDS);
    const fieldWidget = makeWidgetWithType('field', 2, WidgetType.FIELD);

    expect(
      sortWidgetsWithViewportLast([
        timelineWidget,
        fieldsWidget,
        fieldWidget,
      ]).map(({ id }) => id),
    ).toEqual(['fields', 'field', 'timeline']);
  });

  it('keeps two viewport widgets at the end in their existing order', () => {
    const timelineWidget = makeWidgetWithType(
      'timeline',
      0,
      WidgetType.TIMELINE,
    );
    const fieldsWidget = makeWidgetWithType('fields', 1, WidgetType.FIELDS);
    const emailsWidget = makeWidgetWithType('emails', 2, WidgetType.EMAILS);
    const richTextWidget = makeWidgetWithType(
      'rich-text',
      3,
      WidgetType.STANDALONE_RICH_TEXT,
    );

    expect(
      sortWidgetsWithViewportLast([
        timelineWidget,
        fieldsWidget,
        emailsWidget,
        richTextWidget,
      ]).map(({ id }) => id),
    ).toEqual(['fields', 'rich-text', 'timeline', 'emails']);
  });

  it('preserves the order of expandable widgets', () => {
    const fieldsWidget = makeWidgetWithType('fields', 0, WidgetType.FIELDS);
    const fieldWidget = makeWidgetWithType('field', 1, WidgetType.FIELD);

    expect(
      sortWidgetsWithViewportLast([fieldsWidget, fieldWidget]).map(
        ({ id }) => id,
      ),
    ).toEqual(['fields', 'field']);
  });
});
