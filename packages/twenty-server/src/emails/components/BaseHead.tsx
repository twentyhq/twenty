import { Font, Head } from '@react-email/components';
import * as React from 'react';

export const BaseHead = () => {
  return (
    <Head>
      <title>Twenty email</title>
      <Font
        fontFamily="Inter"
        fallbackFontFamily="sans-serif"
        webFont={{
          url: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap',
          format: 'woff2',
        }}
        fontWeight={400}
        fontStyle="normal"
      />
    </Head>
  );
};
