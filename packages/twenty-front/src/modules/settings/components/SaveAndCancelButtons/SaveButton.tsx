import { IconDeviceFloppy } from '@/ui/display/icon';
import useI18n from '@/ui/i18n/useI18n';
import { Button } from '@/ui/input/button/components/Button';

type SaveButtonProps = {
  onSave?: () => void;
  disabled?: boolean;
};

export const SaveButton = ({ onSave, disabled }: SaveButtonProps) => {
  const { translate } = useI18n('translations');
  return (
    <Button
      title={translate('save')}
      variant="primary"
      size="small"
      accent="blue"
      disabled={disabled}
      onClick={onSave}
      Icon={IconDeviceFloppy}
    />
  );
};
