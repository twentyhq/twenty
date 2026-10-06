import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createDropdownOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createDropdownOpenTest';

export const phoneCountryPickerTest: TwentyUiGalleryPlayFunction =
  createDropdownOpenTest({
    triggerName: 'Primary phone country',
    popupText: 'United Kingdom',
  });
