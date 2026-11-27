import { type WidgetVisibilityDevice } from '@/side-panel/pages/page-layout/types/WidgetVisibilityDevice';
import { useLingui } from '@lingui/react/macro';

export const useVisibilityLabels = (): Record<
  WidgetVisibilityDevice,
  string
> => {
  const { t } = useLingui();

  return {
    ANY_DEVICE: t`Any device`,
    MOBILE: t`Mobile`,
    DESKTOP: t`Desktop`,
  };
};
