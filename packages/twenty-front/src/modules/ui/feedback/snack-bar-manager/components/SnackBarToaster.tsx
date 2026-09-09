import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useLingui } from '@lingui/react/macro';
import { Toaster } from 'twenty-ui/feedback';

export const SnackBarToaster = () => {
  const { t } = useLingui();

  return (
    <Toaster
      aria-label={t`Notifications`}
      style={{ zIndex: RootStackingContextZIndices.SnackBar }}
      data-globally-prevent-click-outside
    />
  );
};
