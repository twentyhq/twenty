import useI18n from '@/ui/i18n/useI18n';
import { LightButton } from '@/ui/input/button/components/LightButton';

type CancelButtonProps = {
  onCancel?: () => void;
};

export const CancelButton = ({ onCancel }: CancelButtonProps) => {
  const { translate } = useI18n('translations');
  return (
    <LightButton
      title={translate('cancel')}
      accent="tertiary"
      onClick={onCancel}
    />
  );
};
