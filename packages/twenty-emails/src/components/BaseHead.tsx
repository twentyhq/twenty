import { Font, Head } from '@react-email/components';

import { emailTheme } from 'src/common-style';

export const BaseHead = () => {
  return (
    <Head>
      <title>Twenty email</title>
      <Font
        fontFamily={emailTheme.font.family}
        fallbackFontFamily="sans-serif"
        fontStyle="normal"
        fontWeight={emailTheme.font.weight.regular}
      />
    </Head>
  );
};
