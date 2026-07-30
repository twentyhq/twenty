import { Body, Container, Head, Html } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { type EmailTheme, isEmailTheme } from 'twenty-shared/utils';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';

const BASE_STYLE_RESET = `blockquote,h1,h2,h3,img,li,ol,p,ul{margin-top:0;margin-bottom:0}`;

const themedBody = (theme: EmailTheme, children: React.ReactNode) => (
  <Body
    style={{
      backgroundColor: theme.pageBackground,
      color: theme.textColor,
      margin: 0,
      padding: '24px 12px',
    }}
  >
    <Container
      style={{
        backgroundColor: theme.bodyBackground,
        border: theme.border === 'none' ? undefined : theme.border,
        borderRadius: theme.cornerRadius,
        color: theme.textColor,
        maxWidth: theme.width,
        padding: theme.padding,
      }}
    >
      {children}
    </Container>
  </Body>
);

export const reactMarkupFromJSON = (json: JSONContent | string) => {
  if (typeof json === 'string') {
    return json;
  }

  const jsxNodes = mappedNodeContent(json);
  // Documents authored in the campaign composer carry a page theme; other
  // rich text (workflow emails, tool emails) keeps the bare body.
  const emailTheme = json.attrs?.emailTheme;

  return (
    <Html>
      <Head>
        <style
          dangerouslySetInnerHTML={{
            __html: BASE_STYLE_RESET,
          }}
        />
      </Head>
      {isEmailTheme(emailTheme) ? (
        themedBody(emailTheme, jsxNodes)
      ) : (
        <Body>{jsxNodes}</Body>
      )}
    </Html>
  );
};
