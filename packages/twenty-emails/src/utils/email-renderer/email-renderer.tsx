import { Body, Container, Head, Html } from '@react-email/components';
import { type JSONContent } from '@tiptap/core';
import { mappedNodeContent } from 'src/utils/email-renderer/nodes/render-node';

export type MarkType = NonNullable<JSONContent['marks']>[number];

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
      <Body>
        <Container
          style={{
            width: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
            borderStyle: 'solid',
          }}
        >
          {jsxNodes}
        </Container>
      </Body>
    </Html>
  );
};
