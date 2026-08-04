import { Body, Container, Head, Html } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { type CanvasTheme, resolveCanvasTheme } from 'twenty-shared/utils';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';

const BASE_STYLE_RESET = `blockquote,h1,h2,h3,img,li,ol,p,ul{margin-top:0;margin-bottom:0}`;

const themedBody = (theme: CanvasTheme, children: React.ReactNode) => (
  <Body
    style={{
      backgroundColor: theme.pageBackground,
      color: theme.textColor,
      margin: 0,
      padding: theme.pagePadding,
    }}
  >
    <Container
      style={{
        backgroundColor: theme.bodyBackground,
        border:
          theme.borderWidth !== '' && theme.borderWidth !== '0px'
            ? `${theme.borderWidth} solid ${theme.borderColor}`
            : undefined,
        borderRadius: theme.cornerRadius,
        color: theme.textColor,
        maxWidth: theme.width,
        padding: theme.padding,
        textAlign: theme.textAlign,
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
  // Structured email editors may carry a page theme; legacy rich text and
  // compatibility HTML keep the bare body.
  const canvasTheme = resolveCanvasTheme(json.attrs?.canvasTheme);

  return (
    <Html>
      <Head>
        <style
          dangerouslySetInnerHTML={{
            __html: BASE_STYLE_RESET,
          }}
        />
      </Head>
      {canvasTheme !== null ? (
        themedBody(canvasTheme, jsxNodes)
      ) : (
        <Body>{jsxNodes}</Body>
      )}
    </Html>
  );
};
