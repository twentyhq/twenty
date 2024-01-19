import { IconX } from '@/ui/display/icon';
import useI18n from '@/ui/i18n/useI18n';
import { IconButton } from '@/ui/input/button/components/IconButton';

import {
  StyledContainer,
  StyledDialog,
  StyledHeading,
} from './KeyboardShortcutMenuStyles';

type KeyboardMenuDialogProps = {
  onClose: () => void;
  children: React.ReactNode | React.ReactNode[];
};

export const KeyboardMenuDialog = ({
  onClose,
  children,
}: KeyboardMenuDialogProps) => {
  const { translate } = useI18n('translations');
  return (
    <StyledDialog>
      <StyledHeading>
        {translate('keyboardShortcuts')}
        <IconButton variant="tertiary" Icon={IconX} onClick={onClose} />
      </StyledHeading>
      <StyledContainer>{children}</StyledContainer>
    </StyledDialog>
  );
};
