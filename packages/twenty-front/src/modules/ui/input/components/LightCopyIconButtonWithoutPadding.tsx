import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconCopy } from 'twenty-ui/icon';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

type LightCopyIconButtonWithoutPaddingProps = {
  copyText: string;
};

export const LightCopyIconButtonWithoutPadding = ({
  copyText,
}: LightCopyIconButtonWithoutPaddingProps) => {
  const { copyToClipboard } = useCopyToClipboard();
  const { t } = useLingui();

  return (
    <LightIconButton
      onClick={() => {
        copyToClipboard(copyText, t`Text copied to clipboard`);
      }}
      aria-label={t`Copy to Clipboard`}
    >
      <IconCopy />
    </LightIconButton>
  );
};
