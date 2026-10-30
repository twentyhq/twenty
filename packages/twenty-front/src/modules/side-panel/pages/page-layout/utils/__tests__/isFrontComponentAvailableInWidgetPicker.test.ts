import { isFrontComponentAvailableInWidgetPicker } from '@/side-panel/pages/page-layout/utils/isFrontComponentAvailableInWidgetPicker';
import { PageLayoutType } from '~/generated-metadata/graphql';

const COMPANY_OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000001';
const PERSON_OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000002';

describe('isFrontComponentAvailableInWidgetPicker', () => {
  it('should return true when the page layout type is listed for every object', () => {
    expect(
      isFrontComponentAvailableInWidgetPicker({
        frontComponent: {
          isHeadless: false,
          widgetAvailability: [
            { pageLayoutType: PageLayoutType.RECORD_PAGE },
            { pageLayoutType: PageLayoutType.DASHBOARD },
          ],
        },
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        objectMetadataId: COMPANY_OBJECT_METADATA_ID,
      }),
    ).toBe(true);
  });

  it('should return false when the page layout type is not listed', () => {
    expect(
      isFrontComponentAvailableInWidgetPicker({
        frontComponent: {
          isHeadless: false,
          widgetAvailability: [{ pageLayoutType: PageLayoutType.DASHBOARD }],
        },
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        objectMetadataId: COMPANY_OBJECT_METADATA_ID,
      }),
    ).toBe(false);
  });

  it('should only return true on record pages of the listed objects', () => {
    const frontComponent = {
      isHeadless: false,
      widgetAvailability: [
        {
          pageLayoutType: PageLayoutType.RECORD_PAGE,
          objectMetadataId: COMPANY_OBJECT_METADATA_ID,
        },
      ],
    };

    expect(
      isFrontComponentAvailableInWidgetPicker({
        frontComponent,
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        objectMetadataId: COMPANY_OBJECT_METADATA_ID,
      }),
    ).toBe(true);
    expect(
      isFrontComponentAvailableInWidgetPicker({
        frontComponent,
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        objectMetadataId: PERSON_OBJECT_METADATA_ID,
      }),
    ).toBe(false);
  });

  it('should return false when no widget picker is listed', () => {
    expect(
      isFrontComponentAvailableInWidgetPicker({
        frontComponent: { isHeadless: false, widgetAvailability: [] },
        pageLayoutType: PageLayoutType.DASHBOARD,
      }),
    ).toBe(false);
  });

  it('should return false for a headless front component', () => {
    expect(
      isFrontComponentAvailableInWidgetPicker({
        frontComponent: {
          isHeadless: true,
          widgetAvailability: [{ pageLayoutType: PageLayoutType.DASHBOARD }],
        },
        pageLayoutType: PageLayoutType.DASHBOARD,
      }),
    ).toBe(false);
  });
});
