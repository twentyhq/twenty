import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { IconCopy, IconExclamationCircle } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';
type ClipboardValue = string | Promise<string>;

const writeValueToClipboard = async (value: ClipboardValue) => {
  if (typeof value === 'string') {
    await navigator.clipboard.writeText(value);

    return;
  }

  if (typeof ClipboardItem === 'undefined') {
    await navigator.clipboard.writeText(await value);

    return;
  }

  // Safari drops clipboard writes made after an await, so the pending value is handed over within the click
  await navigator.clipboard.write([
    new ClipboardItem({
      'text/plain': value.then(
        (text) => new Blob([text], { type: 'text/plain' }),
      ),
    }),
  ]);
};

export const useCopyToClipboard = () => {
  const theme = useTheme();
  const { enqueueToast } = useToast();
  const { t } = useLingui();

  const writeToClipboard = async (
    value: ClipboardValue,
    successMessage: string | null,
  ) => {
    if (!window.isSecureContext) {
      enqueueToast({
        status: 'error',
        children: t`Clipboard requires a secure connection (HTTPS). Please access this app over HTTPS to enable copying.`,
        icon: <IconExclamationCircle size={16} color="red" />,
        duration: 6000,
      });

      return;
    }

    try {
      await writeValueToClipboard(value);

      if (!isDefined(successMessage)) {
        return;
      }

      enqueueToast({
        status: 'success',
        children: successMessage,
        icon: <IconCopy size={theme.icon.size.md} />,
        duration: 2000,
      });
    } catch {
      enqueueToast({
        status: 'error',
        children: t`Couldn't copy to clipboard`,
        icon: <IconExclamationCircle size={16} color="red" />,
        duration: 2000,
      });
    }
  };

  const copyToClipboard = async (value: ClipboardValue, message?: string) =>
    await writeToClipboard(value, message || t`Copied to clipboard`);

  const copyToClipboardWithoutSuccessToast = async (value: ClipboardValue) =>
    await writeToClipboard(value, null);

  return { copyToClipboard, copyToClipboardWithoutSuccessToast };
};
