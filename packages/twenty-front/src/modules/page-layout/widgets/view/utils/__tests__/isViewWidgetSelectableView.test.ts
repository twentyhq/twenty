import { isViewWidgetSelectableView } from '@/page-layout/widgets/view/utils/isViewWidgetSelectableView';
import { ViewVisibility } from '~/generated-metadata/graphql';

describe('isViewWidgetSelectableView', () => {
  it('accepts views shared with the workspace', () => {
    expect(
      isViewWidgetSelectableView({ visibility: ViewVisibility.WORKSPACE }),
    ).toBe(true);
  });

  it('rejects personal views', () => {
    expect(
      isViewWidgetSelectableView({ visibility: ViewVisibility.UNLISTED }),
    ).toBe(false);
  });
});
