import { getLocalizedToastProps } from '@/ui/feedback/toast/utils/getLocalizedToastProps';
import { isDefined } from 'twenty-shared/utils';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useLingui } from '@lingui/react/macro';
import { Toaster, type ToasterProps } from 'twenty-ui/components/feedback';

type AppToasterProps = Pick<ToasterProps, 'container'> & {
  progress?: number;
};

export const AppToaster = ({ container, progress }: AppToasterProps) => {
  const { t, i18n } = useLingui();

  return (
    <Toaster
      container={container}
      aria-label={t`Notifications`}
      getToastProps={(toast) => ({
        ...getLocalizedToastProps({ toast, i18n }),
        ...(isDefined(progress) ? { progress } : {}),
      })}
      style={{ zIndex: RootStackingContextZIndices.Toaster }}
      data-globally-prevent-click-outside
    />
  );
};
