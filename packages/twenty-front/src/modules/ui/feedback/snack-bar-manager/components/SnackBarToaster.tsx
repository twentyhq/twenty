import { getLocalizedToastProps } from '@/ui/feedback/snack-bar-manager/utils/getLocalizedToastProps';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useLingui } from '@lingui/react/macro';
import { Toaster } from 'twenty-ui/feedback';

export const SnackBarToaster = () => {
  const { t, i18n } = useLingui();

  return (
    <Toaster
      aria-label={t`Notifications`}
      getToastProps={(toast) => getLocalizedToastProps(toast, i18n)}
      style={{ zIndex: RootStackingContextZIndices.SnackBar }}
      data-globally-prevent-click-outside
    />
  );
};
