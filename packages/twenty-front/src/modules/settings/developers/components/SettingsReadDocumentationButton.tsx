import { Button, IconBook2 } from 'twenty-ui';

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
