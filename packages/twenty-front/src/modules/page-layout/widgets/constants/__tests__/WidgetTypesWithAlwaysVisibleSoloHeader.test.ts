import { WIDGET_TYPES_WITH_ALWAYS_VISIBLE_SOLO_HEADER } from '@/page-layout/widgets/constants/WidgetTypesWithAlwaysVisibleSoloHeader';
import { WidgetType } from '~/generated-metadata/graphql';

describe('WIDGET_TYPES_WITH_ALWAYS_VISIBLE_SOLO_HEADER', () => {
  it('keeps the timeline header mounted so its filter action is visible', () => {
    expect(WIDGET_TYPES_WITH_ALWAYS_VISIBLE_SOLO_HEADER).toContain(
      WidgetType.TIMELINE,
    );
  });
});
