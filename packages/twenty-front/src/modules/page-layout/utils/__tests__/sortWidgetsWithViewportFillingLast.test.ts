import { makeWidget } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { sortWidgetsWithViewportFillingLast } from '@/page-layout/utils/sortWidgetsWithViewportFillingLast';
import { WidgetType } from '~/generated-metadata/graphql';

const makeWidgetWithType = (
  id: string,
  index: number,
  type: WidgetType,
): PageLayoutWidget => ({
  ...makeWidget(id, index),
  type,
});

describe('sortWidgetsWithViewportFillingLast', () => {
  it('normalizes a viewport-filling widget after fit-content widgets during edits', () => {
    const timelineWidget = makeWidgetWithType(
      'timeline',
      0,
      WidgetType.TIMELINE,
    );
    const fieldsWidget = makeWidgetWithType('fields', 1, WidgetType.FIELDS);
    const fieldWidget = makeWidgetWithType('field', 2, WidgetType.FIELD);

    expect(
      sortWidgetsWithViewportFillingLast([
        timelineWidget,
        fieldsWidget,
        fieldWidget,
      ]).map(({ id }) => id),
    ).toEqual(['fields', 'field', 'timeline']);
  });

  it('keeps two viewport-filling widgets at the end in their existing order', () => {
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
      sortWidgetsWithViewportFillingLast([
        timelineWidget,
        fieldsWidget,
        emailsWidget,
        richTextWidget,
      ]).map(({ id }) => id),
    ).toEqual(['fields', 'rich-text', 'timeline', 'emails']);
  });

  it('preserves the order of fit-content widgets', () => {
    const fieldsWidget = makeWidgetWithType('fields', 0, WidgetType.FIELDS);
    const fieldWidget = makeWidgetWithType('field', 1, WidgetType.FIELD);

    expect(
      sortWidgetsWithViewportFillingLast([fieldsWidget, fieldWidget]).map(
        ({ id }) => id,
      ),
    ).toEqual(['fields', 'field']);
  });
});
