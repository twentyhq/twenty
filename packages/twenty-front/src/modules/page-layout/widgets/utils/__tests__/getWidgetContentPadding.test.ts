import { getWidgetContentPadding } from '@/page-layout/widgets/utils/getWidgetContentPadding';
import { WidgetType } from '~/generated-metadata/graphql';

describe('getWidgetContentPadding', () => {
  it.each([
    WidgetType.WORKFLOW,
    WidgetType.WORKFLOW_RUN,
    WidgetType.WORKFLOW_VERSION,
  ])('returns no padding for %s', (widgetType) => {
    expect(getWidgetContentPadding(widgetType)).toBe('none');
  });

  it('returns default padding for other widget types', () => {
    expect(getWidgetContentPadding(WidgetType.TASKS)).toBe('default');
  });
});
