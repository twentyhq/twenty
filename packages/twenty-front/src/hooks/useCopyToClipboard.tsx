import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import { IconCopy, IconExclamationCircle } from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';
export const useCopyToClipboard = () => {
  const { theme } = useContext(ThemeContext);
  const { add: addToast } = useToast();
  const { t } = useLingui();

  const writeToClipboard = async (
    valueAsString: string,
    successMessage: string | null,
  ) => {
    if (!window.isSecureContext) {
      addToast({
        variant: 'error',
        children: t`Clipboard requires a secure connection (HTTPS). Please access this app over HTTPS to enable copying.`,
        icon: <IconExclamationCircle size={16} color="red" />,
        duration: 6000,
      });

      return;
    }

    try {
      await navigator.clipboard.writeText(valueAsString);

      if (!isDefined(successMessage)) {
        return;
      }

      addToast({
        variant: 'success',
        children: successMessage,
        icon: <IconCopy size={theme.icon.size.md} />,
        duration: 2000,
      });
    } catch {
      addToast({
        variant: 'error',
        children: t`Couldn't copy to clipboard`,
        icon: <IconExclamationCircle size={16} color="red" />,
        duration: 2000,
      });
    }
  };

  const copyToClipboard = async (valueAsString: string, message?: string) =>
    await writeToClipboard(valueAsString, message || t`Copied to clipboard`);

  const copyToClipboardWithoutSuccessToast = async (valueAsString: string) =>
    await writeToClipboard(valueAsString, null);

  return { copyToClipboard, copyToClipboardWithoutSuccessToast };
};
