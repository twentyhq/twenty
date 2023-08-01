import { Button, ButtonSize } from '@/ui/button/components/Button';
import { Modal } from '@/ui/modal/components/Modal';

type ContinueButtonProps = {
  onContinue: (val: any) => void;
  title: string;
  isLoading?: boolean;
};

export const ContinueButton = ({
  onContinue,
  title,
  isLoading,
}: ContinueButtonProps) => (
  <Modal.Footer>
    <Button size={ButtonSize.Medium} title={title} onClick={onContinue}>
      {title}
    </Button>
  </Modal.Footer>
);
