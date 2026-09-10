import { getLocalizedToastProps } from '@/ui/feedback/toast/utils/getLocalizedToastProps';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useLingui } from '@lingui/react/macro';
import { Toaster, type ToasterProps } from 'twenty-ui/feedback';

type AppToasterProps = Pick<ToasterProps, 'container'>;

export const AppToaster = ({ container }: AppToasterProps) => {
  const { t, i18n } = useLingui();

  return (
    <Toaster
      container={container}
      aria-label={t`Notifications`}
      getToastProps={(toast) => getLocalizedToastProps(toast, i18n)}
      style={{ zIndex: RootStackingContextZIndices.Toaster }}
      data-globally-prevent-click-outside
    />
  );
};
