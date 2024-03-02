import { IconBook2 } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';

export const ReadDocumentationButton = () => {
  return (
    <Button
      title="Read documentation"
      variant="primary"
      accent="default"
      size="small"
      Icon={IconBook2}
      onClick={() => {
        window.open('https://docs.twenty.com');
      }}
    ></Button>
  );
};
