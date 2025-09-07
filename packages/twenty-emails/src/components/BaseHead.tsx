import { Font, Head } from '@react-email/components';
import { i18n } from '@lingui/core';
import { isRtlLocale } from 'twenty-shared/utils';

import { emailTheme } from 'src/common-style';

export const BaseHead = () => {
  const rtl = isRtlLocale(i18n.locale);

  return (
    <Head>
      <title>Twenty email</title>
      {rtl ? (
        <>
          <Font
            fontFamily={emailTheme.font.family}
            fallbackFontFamily="sans-serif"
            fontStyle="normal"
            fontWeight={emailTheme.font.weight.regular}
            webFont={{
              url: 'https://fonts.gstatic.com/s/vazirmatn/v15/Dxx78j6PP2D_kU2muijPEe1n2vVbfJRklWgzORc.ttf',
              format: 'truetype',
            }}
          />
          <Font
            fontFamily={emailTheme.font.family}
            fallbackFontFamily="sans-serif"
            fontStyle="normal"
            fontWeight={emailTheme.font.weight.bold}
            webFont={{
              url: 'https://fonts.gstatic.com/s/vazirmatn/v15/Dxx78j6PP2D_kU2muijPEe1n2vVbfJRklbY0ORc.ttf',
              format: 'truetype',
            }}
          />
        </>
      ) : (
        <Font
          fontFamily={emailTheme.font.family}
          fallbackFontFamily="sans-serif"
          fontStyle="normal"
          fontWeight={emailTheme.font.weight.regular}
        />
      )}
    </Head>
  );
};
