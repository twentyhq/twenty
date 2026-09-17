import { isUsableLastVisitedView } from '@/views/utils/isUsableLastVisitedView';
import { ViewKey, ViewType } from '~/generated-metadata/graphql';

describe('isUsableLastVisitedView', () => {
  it('should refuse a missing last visited view', () => {
    expect(
      isUsableLastVisitedView({
        lastVisitedView: undefined,
        isInitialObjectViewEnabled: true,
      }),
    ).toBe(false);
  });

  it('should refuse a widget view whatever the flag', () => {
    expect(
      isUsableLastVisitedView({
        lastVisitedView: { key: null, type: ViewType.TABLE_WIDGET },
        isInitialObjectViewEnabled: false,
      }),
    ).toBe(false);
  });

  it('should refuse the index view when the flag is on', () => {
    expect(
      isUsableLastVisitedView({
        lastVisitedView: { key: ViewKey.INDEX, type: ViewType.TABLE },
        isInitialObjectViewEnabled: true,
      }),
    ).toBe(false);
  });

  it('should accept the index view when the flag is off', () => {
    expect(
      isUsableLastVisitedView({
        lastVisitedView: { key: ViewKey.INDEX, type: ViewType.TABLE },
        isInitialObjectViewEnabled: false,
      }),
    ).toBe(true);
  });

  it('should accept a user owned view whatever the flag', () => {
    expect(
      isUsableLastVisitedView({
        lastVisitedView: { key: null, type: ViewType.TABLE },
        isInitialObjectViewEnabled: true,
      }),
    ).toBe(true);
  });
});
