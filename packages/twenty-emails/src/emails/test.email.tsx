import { BaseEmail } from 'src/components/BaseEmail';
import { Title } from 'src/components/Title';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

type TestEmailProps = {
  locale: keyof typeof APP_LOCALES;
};

// This is a test email which isn't used in production
// It's useful to do tests and play in a local environment
export const TestEmail = ({ locale }: TestEmailProps) => {
  const i18n = createI18nInstance(locale);

  return (
    <BaseEmail locale={locale}>
      <Title value={i18n._('Test email')} />
      <br />
      <br />
    </BaseEmail>
  );
};

TestEmail.PreviewProps = {
  locale: 'en',
};

export default TestEmail;
