import { Button } from 'twenty-ui';

import { IconBook2 } from '@/ui/display/icon';

export const SettingsReadDocumentationButton = () => {
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
