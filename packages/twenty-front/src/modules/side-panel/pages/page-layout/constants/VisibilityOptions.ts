import { VISIBILITY_ANY_DEVICE } from '@/side-panel/pages/page-layout/constants/VisibilityAnyDevice';
import { VISIBILITY_DESKTOP } from '@/side-panel/pages/page-layout/constants/VisibilityDesktop';
import { VISIBILITY_MOBILE } from '@/side-panel/pages/page-layout/constants/VisibilityMobile';

export const VISIBILITY_OPTIONS = [
  { id: VISIBILITY_ANY_DEVICE },
  { id: VISIBILITY_MOBILE },
  { id: VISIBILITY_DESKTOP },
] as const;
