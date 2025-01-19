import { useLingui } from '@lingui/react/macro';
import { Button, IconBook2 } from 'twenty-ui';

export const SettingsReadDocumentationButton = () => {
  const { t } = useLingui();

  return (
    <Button
      title={t`Read documentation`}
      variant="secondary"
      accent="default"
      size="small"
      Icon={IconBook2}
      to={'https://docs.twenty.com'}
      target="_blank"
    ></Button>
  );
};
