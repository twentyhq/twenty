import { isUsableLastVisitedView } from '@/views/utils/isUsableLastVisitedView';
import { ViewKey, ViewType } from '~/generated-metadata/graphql';

describe('isUsableLastVisitedView', () => {
  it('should refuse a missing last visited view', () => {
    expect(
      isUsableLastVisitedView({
        lastVisitedView: undefined,
      }),
    ).toBe(false);
  });

  it('should refuse a widget view', () => {
    expect(
      isUsableLastVisitedView({
        lastVisitedView: { key: null, type: ViewType.TABLE_WIDGET },
      }),
    ).toBe(false);
  });

  it('should refuse the index view', () => {
    expect(
      isUsableLastVisitedView({
        lastVisitedView: { key: ViewKey.INDEX, type: ViewType.TABLE },
      }),
    ).toBe(false);
  });

  it('should accept a user owned view', () => {
    expect(
      isUsableLastVisitedView({
        lastVisitedView: { key: null, type: ViewType.TABLE },
      }),
    ).toBe(true);
  });
});
