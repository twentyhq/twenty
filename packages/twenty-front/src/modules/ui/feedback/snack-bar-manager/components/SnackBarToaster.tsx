import { getLocalizedToastProps } from '@/ui/feedback/snack-bar-manager/utils/getLocalizedToastProps';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useLingui } from '@lingui/react/macro';
import { Toaster, type ToasterProps } from 'twenty-ui/feedback';

type SnackBarToasterProps = Pick<ToasterProps, 'container'>;

export const SnackBarToaster = ({ container }: SnackBarToasterProps) => {
  const { t, i18n } = useLingui();

  return (
    <Toaster
      container={container}
      aria-label={t`Notifications`}
      getToastProps={(toast) => getLocalizedToastProps(toast, i18n)}
      style={{ zIndex: RootStackingContextZIndices.SnackBar }}
      data-globally-prevent-click-outside
    />
  );
};
