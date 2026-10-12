import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createDropdownOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createDropdownOpenTest';

export const dropdownTest: TwentyUiGalleryPlayFunction = createDropdownOpenTest(
  {
    triggerName: 'Choose assignee',
    popupText: 'Assign person',
  },
);
