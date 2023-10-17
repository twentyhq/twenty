import { Button } from '@/ui/input/button/components/Button';

type CancelButtonProps = {
  onClick?: () => void;
};

export const CancelButton = ({ onClick }: CancelButtonProps) => {
  return <Button title="Cancel" variant="tertiary" onClick={onClick} />;
};
