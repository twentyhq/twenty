import { IconBook2 } from 'twenty-ui';

import { Button } from '@/ui/input/button/components/Button';

export const SettingsReadDocumentationButton = () => {
  return (
    <Button
      title="Read documentation"
      variant="primary"
      accent="default"
      size="small"
      Icon={IconBook2}
      to={'https://docs.twenty.com'}
      target="_blank"
    ></Button>
  );
};
