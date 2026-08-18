import { type ReactNode } from 'react';
import { Body, Container, Head, Html } from 'react-email';
import { isNonEmptyString } from '@sniptt/guards';
import { type JSONContent } from '@tiptap/core';
import { type CanvasTheme, resolveCanvasTheme } from 'twenty-shared/utils';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';

const BASE_STYLE_RESET = `blockquote,h1,h2,h3,img,li,ol,p,ul{margin-top:0;margin-bottom:0}`;
const COLOR_SCHEME_DECLARATION = `:root{color-scheme:light dark;supported-color-schemes:light dark}`;

const EMAIL_PAGE_CLASS_NAME = 'email-page';
const EMAIL_BODY_CLASS_NAME = 'email-body';

const SAFE_CSS_COLOR_PATTERN = /^[#a-zA-Z0-9(),.%\s-]+$/;

const hasBorder = (theme: CanvasTheme) =>
  isNonEmptyString(theme.borderWidth) && theme.borderWidth !== '0px';

const darkColorSchemeStyle = (theme: CanvasTheme): string => {
  const pageDeclarations: string[] = [];
  const bodyDeclarations: string[] = [];

  const addDeclaration = (
    declarations: string[],
    property: string,
    color: string,
  ) => {
    if (isNonEmptyString(color) && SAFE_CSS_COLOR_PATTERN.test(color)) {
      declarations.push(`${property}:${color} !important`);
    }
  };

  addDeclaration(
    pageDeclarations,
    'background-color',
    theme.dark.pageBackground,
  );
  addDeclaration(pageDeclarations, 'color', theme.dark.textColor);
  addDeclaration(
    bodyDeclarations,
    'background-color',
    theme.dark.bodyBackground,
  );
  addDeclaration(bodyDeclarations, 'color', theme.dark.textColor);

  if (hasBorder(theme)) {
    addDeclaration(bodyDeclarations, 'border-color', theme.dark.borderColor);
  }

  const rules: string[] = [];

  if (pageDeclarations.length > 0) {
    rules.push(`.${EMAIL_PAGE_CLASS_NAME}{${pageDeclarations.join(';')}}`);
  }

  if (bodyDeclarations.length > 0) {
    rules.push(`.${EMAIL_BODY_CLASS_NAME}{${bodyDeclarations.join(';')}}`);
  }

  return rules.length === 0
    ? ''
    : `@media (prefers-color-scheme:dark){${rules.join('')}}`;
};

const themedBody = (theme: CanvasTheme, children: ReactNode) => (
  <Body
    className={EMAIL_PAGE_CLASS_NAME}
    style={{
      backgroundColor: theme.pageBackground,
      color: theme.textColor,
      margin: 0,
      padding: theme.pagePadding,
    }}
  >
    <Container
      className={EMAIL_BODY_CLASS_NAME}
      style={{
        backgroundColor: theme.bodyBackground || undefined,
        border: hasBorder(theme)
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
  const canvasTheme = resolveCanvasTheme(json.attrs?.canvasTheme);

  return (
    <Html>
      <Head>
        {/* Declaring a dark scheme stops clients from auto-inverting, so only
            themed documents (which ship their own dark rules) opt in. */}
        {canvasTheme !== null && (
          <>
            <meta name="color-scheme" content="light dark" />
            <meta name="supported-color-schemes" content="light dark" />
          </>
        )}
        <style
          dangerouslySetInnerHTML={{
            __html:
              canvasTheme !== null
                ? `${BASE_STYLE_RESET}${COLOR_SCHEME_DECLARATION}${darkColorSchemeStyle(canvasTheme)}`
                : BASE_STYLE_RESET,
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
