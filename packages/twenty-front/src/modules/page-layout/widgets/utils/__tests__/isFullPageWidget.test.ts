import { isFullPageWidget } from '@/page-layout/widgets/utils/isFullPageWidget';
import { PageLayoutType } from '~/generated-metadata/graphql';

describe('isFullPageWidget', () => {
  it('returns true for the only widget of a standalone page', () => {
    expect(
      isFullPageWidget({
        pageLayoutType: PageLayoutType.STANDALONE_PAGE,
        presentation: 'solo',
      }),
    ).toBe(true);
  });

  it.each([
    ['a stacked standalone page', PageLayoutType.STANDALONE_PAGE, 'stack'],
    ['a solo record page tab', PageLayoutType.RECORD_PAGE, 'solo'],
    ['a dashboard', PageLayoutType.DASHBOARD, 'stack'],
  ] as const)('returns false on %s', (_label, pageLayoutType, presentation) => {
    expect(isFullPageWidget({ pageLayoutType, presentation })).toBe(false);
  });
});
