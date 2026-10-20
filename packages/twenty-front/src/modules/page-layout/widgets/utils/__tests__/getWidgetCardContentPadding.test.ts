import { getWidgetCardContentPadding } from '@/page-layout/widgets/utils/getWidgetCardContentPadding';
import { PageLayoutType, WidgetType } from '~/generated-metadata/graphql';

describe('getWidgetCardContentPadding', () => {
  it('returns no padding for the only app of a standalone page', () => {
    expect(
      getWidgetCardContentPadding({
        isEditable: false,
        pageLayoutType: PageLayoutType.STANDALONE_PAGE,
        presentation: 'solo',
        variant: 'flush',
        widgetType: WidgetType.FRONT_COMPONENT,
      }),
    ).toBe('none');
  });

  it('returns default padding for a framed card', () => {
    expect(
      getWidgetCardContentPadding({
        isEditable: false,
        pageLayoutType: PageLayoutType.DASHBOARD,
        presentation: 'stack',
        variant: 'framed',
        widgetType: WidgetType.WORKFLOW,
      }),
    ).toBe('default');
  });

  it('returns the widget type padding for a flush card in view mode', () => {
    expect(
      getWidgetCardContentPadding({
        isEditable: false,
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        presentation: 'solo',
        variant: 'flush',
        widgetType: WidgetType.WORKFLOW,
      }),
    ).toBe('none');
  });
});
