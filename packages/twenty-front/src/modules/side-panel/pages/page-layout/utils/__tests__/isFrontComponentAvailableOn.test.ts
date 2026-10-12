import { isFrontComponentAvailableOn } from '@/side-panel/pages/page-layout/utils/isFrontComponentAvailableOn';
import { FrontComponentSurface } from '~/generated-metadata/graphql';

describe('isFrontComponentAvailableOn', () => {
  it('should return true when the surface is listed', () => {
    expect(
      isFrontComponentAvailableOn({
        frontComponent: {
          isHeadless: false,
          availableOn: [
            FrontComponentSurface.OBJECTS,
            FrontComponentSurface.DASHBOARDS,
          ],
        },
        surface: FrontComponentSurface.DASHBOARDS,
      }),
    ).toBe(true);
  });

  it('should return false when the surface is not listed', () => {
    expect(
      isFrontComponentAvailableOn({
        frontComponent: {
          isHeadless: false,
          availableOn: [FrontComponentSurface.DASHBOARDS],
        },
        surface: FrontComponentSurface.OBJECTS,
      }),
    ).toBe(false);
  });

  it('should return false for a headless front component', () => {
    expect(
      isFrontComponentAvailableOn({
        frontComponent: {
          isHeadless: true,
          availableOn: [FrontComponentSurface.OBJECTS],
        },
        surface: FrontComponentSurface.OBJECTS,
      }),
    ).toBe(false);
  });
});
