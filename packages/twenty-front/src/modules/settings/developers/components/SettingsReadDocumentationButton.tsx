import { Button, IconBook2 } from 'twenty-ui';

export const SettingsReadDocumentationButton = () => {
  return (
    <Button
      title="Read documentation"
      variant="secondary"
      accent="default"
      size="small"
      Icon={IconBook2}
      to={'https://docs.twenty.com'}
      target="_blank"
    ></Button>
  );
};
