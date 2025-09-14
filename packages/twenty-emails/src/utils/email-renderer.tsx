import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Text,
} from '@react-email/components';
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
          case 'link':
            return this.link(mark, text);
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

  private link(mark: MarkType, text: ReactNode): ReactNode {
    const {
      href,
      target = '_blank',
      rel = 'noopener noreferrer',
    } = mark?.attrs || {};

    return (
      <a
        href={href}
        target={target}
        rel={rel}
        style={{ textDecoration: 'underline' }}
      >
        {text}
      </a>
    );
  }

  private renderNode(node: JSONContent): ReactNode {
    switch (node.type) {
      case 'paragraph':
        return this.paragraph(node);
      case 'text':
        return this.text(node);
      case 'heading':
        return this.heading(node);
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
    if (!isDefined(text)) {
      return <>&nbsp;</>;
    }

    return <>{text}</>;
  }

  heading(node: JSONContent): ReactNode {
    const { level } = node?.attrs || {};
    if (!isDefined(level)) {
      return null;
    }

    const content = this.getMappedContent(node);
    if (level === 1) {
      return (
        <Heading as="h1" style={{ fontSize: '36px' }}>
          {content}
        </Heading>
      );
    }

    if (level === 2) {
      return (
        <Heading as="h2" style={{ fontSize: '30px' }}>
          {content}
        </Heading>
      );
    }

    if (level === 3) {
      return (
        <Heading as="h3" style={{ fontSize: '24px' }}>
          {content}
        </Heading>
      );
    }
  }
}

export const reactMarkupFromJSON = (json: JSONContent | string) => {
  if (typeof json === 'string') {
    return json;
  }

  const renderer = new EmailRenderer();
  return renderer.markup(json);
};
