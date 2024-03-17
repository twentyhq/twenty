import { LightButton } from 'twenty-ui';

type CancelButtonProps = {
  onCancel?: () => void;
};

export const CancelButton = ({ onCancel }: CancelButtonProps) => {
  return <LightButton title="Cancel" accent="tertiary" onClick={onCancel} />;
};
