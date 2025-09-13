import { Body, Container, Head, Html, Text } from '@react-email/components';
import type { JSONContent } from '@tiptap/core';
import { Fragment, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

type MarkType = NonNullable<JSONContent['marks']>[number];

export class EmailRenderer {
  private readonly marksOrder = [
    'underline',
    'bold',
    'italic',
    'textStyle',
    'link',
    'strike',
  ];

  constructor() {}

  markup(json: JSONContent) {
    const jsxNodes = this.getMappedContent(json);

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
  }

  private renderMark(node: JSONContent): ReactNode {
    // It will wrap the text with the corresponding mark type
    const text = node?.text || <>&nbsp;</>;
    const marks = node?.marks || [];

    // sort the marks by uderline, bold, italic, textStyle, link
    // so that the text will be wrapped in the correct order
    marks.sort((a, b) => {
      return this.marksOrder.indexOf(a.type) - this.marksOrder.indexOf(b.type);
    });

    return marks.reduce(
      (_: ReactNode, mark: MarkType) => {
        const type = mark.type;

        switch (type) {
          case 'underline':
            return this.underline(mark, text);
          case 'bold':
            return this.bold(mark, text);
          case 'italic':
            return this.italic(mark, text);
          case 'strike':
            return this.strike(mark, text);
          default:
            return <>{text}</>;
        }
      },
      <>{text}</>,
    );
  }

  private bold(_: MarkType, text: ReactNode): ReactNode {
    return <strong>{text}</strong>;
  }

  private italic(_: MarkType, text: ReactNode): ReactNode {
    return <em>{text}</em>;
  }

  private underline(_: MarkType, text: ReactNode): ReactNode {
    return <u>{text}</u>;
  }

  private strike(_: MarkType, text: ReactNode): ReactNode {
    return <s style={{ textDecoration: 'line-through' }}>{text}</s>;
  }

  private renderNode(node: JSONContent): ReactNode {
    switch (node.type) {
      case 'paragraph':
        return this.paragraph(node);
      case 'text':
        return this.text(node);
      default:
        return <>{node.type}</>;
    }
  }

  private getMappedContent(node: JSONContent): JSX.Element[] {
    const allNodes = node.content || [];

    return allNodes
      .map((childNode, index) => {
        const component = this.renderNode(childNode);

        if (!component) {
          return null;
        }

        return <Fragment key={index}>{component}</Fragment>;
      })
      .filter((n) => n !== null) as JSX.Element[];
  }

  paragraph(node: JSONContent): ReactNode {
    return <Text>{this.getMappedContent(node)}</Text>;
  }

  text(node: JSONContent): ReactNode {
    if (isDefined(node?.marks)) {
      return this.renderMark(node);
    }

    const { text } = node;

    return text ? <>{text}</> : <>&nbsp;</>;
  }
}

export const reactMarkupFromJSON = (json: JSONContent | string) => {
  if (typeof json === 'string') {
    return json;
  }

  const renderer = new EmailRenderer();
  return renderer.markup(json);
};
