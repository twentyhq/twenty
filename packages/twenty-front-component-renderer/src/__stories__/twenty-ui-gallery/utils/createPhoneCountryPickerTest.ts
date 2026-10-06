import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createDropdownOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createDropdownOpenTest';

export const createPhoneCountryPickerTest = (
  runtime: 'react' | 'preact',
): TwentyUiGalleryPlayFunction =>
  createDropdownOpenTest({
    runtime,
    triggerName: 'Primary phone country',
    popupText: 'United Kingdom',
  });
