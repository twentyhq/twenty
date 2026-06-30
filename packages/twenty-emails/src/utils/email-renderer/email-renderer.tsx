import { Body, Head, Html } from '@react-email/components';
import { type JSONContent } from '@tiptap/core';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';

export const reactMarkupFromJSON = (json: JSONContent | string) => {
  if (typeof json === 'string') {
    return json;
  }

  const jsxNodes = mappedNodeContent(json);
  return (
    <Html>
      <Head>
        <style
          dangerouslySetInnerHTML={{
            __html: `blockquote,h1,h2,h3,img,li,ol,p,ul{margin-top:0;margin-bottom:0}`,
          }}
        />
      </Head>
      <Body>{jsxNodes}</Body>
    </Html>
  );
};
