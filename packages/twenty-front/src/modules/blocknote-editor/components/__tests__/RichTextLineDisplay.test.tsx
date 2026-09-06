import { type PartialBlock } from '@blocknote/core';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  RichTextLineDisplay,
  getFirstNonEmptyBlock,
  getBlockPlainText,
} from '@/blocknote-editor/components/RichTextLineDisplay';

describe('RichTextLineDisplay', () => {
  it('should render null when blocks is null or empty', () => {
    const { container: nullContainer } = render(
      <RichTextLineDisplay blocks={null} />,
    );
    expect(nullContainer.firstChild).toBeNull();

    const { container: emptyContainer } = render(
      <RichTextLineDisplay blocks={[]} />,
    );
    expect(emptyContainer.firstChild).toBeNull();
  });

  it('should render null when all blocks are empty', () => {
    const blocks: PartialBlock[] = [
      { content: [{ type: 'text', text: '', styles: {} }] },
      { content: [{ type: 'text', text: '   ', styles: {} }] },
    ];
    const { container } = render(<RichTextLineDisplay blocks={blocks} />);
    expect(container.firstChild).toBeNull();
  });

  it('should preserve strikethrough text effect', () => {
    const blocks: PartialBlock[] = [
      {
        content: [
          { type: 'text', text: 'test ', styles: {} },
          { type: 'text', text: 'strikethrough', styles: { strike: true } },
        ],
      },
    ];

    render(<RichTextLineDisplay blocks={blocks} />);

    const strikethroughSpan = screen.getByText('strikethrough');
    expect(strikethroughSpan).toHaveStyle({
      textDecoration: 'line-through',
    });

    const testSpan = screen.getByText('test');
    expect(testSpan).not.toHaveStyle({
      textDecoration: 'line-through',
    });
  });

  it('should preserve bold, italic, and underline text effects', () => {
    const blocks: PartialBlock[] = [
      {
        content: [
          { type: 'text', text: 'bold text', styles: { bold: true } },
          { type: 'text', text: 'italic text', styles: { italic: true } },
          {
            type: 'text',
            text: 'underline text',
            styles: { underline: true },
          },
        ],
      },
    ];

    render(<RichTextLineDisplay blocks={blocks} />);

    expect(screen.getByText('bold text')).toHaveStyle({
      fontWeight: 'bold',
    });
    expect(screen.getByText('italic text')).toHaveStyle({
      fontStyle: 'italic',
    });
    expect(screen.getByText('underline text')).toHaveStyle({
      textDecoration: 'underline',
    });
  });

  it('should combine underline and strikethrough', () => {
    const blocks: PartialBlock[] = [
      {
        content: [
          {
            type: 'text',
            text: 'both styles',
            styles: { underline: true, strike: true },
          },
        ],
      },
    ];

    render(<RichTextLineDisplay blocks={blocks} />);

    expect(screen.getByText('both styles')).toHaveStyle({
      textDecoration: 'underline line-through',
    });
  });

  it('should preserve code styling', () => {
    const blocks: PartialBlock[] = [
      {
        content: [
          { type: 'text', text: 'const x = 1;', styles: { code: true } },
        ],
      },
    ];

    render(<RichTextLineDisplay blocks={blocks} />);

    expect(screen.getByText('const x = 1;')).toHaveStyle({
      fontFamily: 'monospace',
    });
  });

  it('should apply textColor and backgroundColor', () => {
    const blocks: PartialBlock[] = [
      {
        content: [
          {
            type: 'text',
            text: 'colored',
            styles: { textColor: 'red', backgroundColor: 'yellow' },
          },
        ],
      },
    ];

    render(<RichTextLineDisplay blocks={blocks} />);

    expect(screen.getByText('colored')).toHaveStyle({
      color: themeCssVariables.color.red,
      backgroundColor: themeCssVariables.color.yellow3,
    });
  });

  it('should render links with underline and mention chips with @ prefix', () => {
    const blocks: PartialBlock[] = [
      {
        content: [
          {
            type: 'link',
            href: 'https://twenty.com',
            content: [{ type: 'text', text: 'Twenty Website', styles: {} }],
          } as unknown as any,
          {
            type: 'mention',
            props: { label: 'John Doe', recordId: '123' },
          } as unknown as any,
        ],
      },
    ];

    render(<RichTextLineDisplay blocks={blocks} />);

    expect(screen.getByText('Twenty Website')).toBeInTheDocument();
    expect(screen.getByText('@John Doe')).toBeInTheDocument();
  });

  it('should set title attribute on the container with full plain text', () => {
    const blocks: PartialBlock[] = [
      {
        content: [
          { type: 'text', text: 'test ', styles: {} },
          { type: 'text', text: 'strikethrough', styles: { strike: true } },
        ],
      },
    ];

    const { container } = render(<RichTextLineDisplay blocks={blocks} />);

    expect(container.firstChild).toHaveAttribute('title', 'test strikethrough');
  });
});

describe('getFirstNonEmptyBlock and getBlockPlainText', () => {
  it('should find the first block with non-empty content', () => {
    const blocks: PartialBlock[] = [
      { content: [{ type: 'text', text: '   ', styles: {} }] },
      { content: [{ type: 'text', text: 'Second block', styles: {} }] },
      { content: [{ type: 'text', text: 'Third block', styles: {} }] },
    ];

    const firstNonEmpty = getFirstNonEmptyBlock(blocks);
    expect(firstNonEmpty).toBe(blocks[1]);
    expect(getBlockPlainText(firstNonEmpty!)).toBe('Second block');
  });

  it('should return null if no blocks have non-empty content', () => {
    const blocks: PartialBlock[] = [
      { content: [] },
      { content: undefined },
      { content: '   ' },
    ];

    expect(getFirstNonEmptyBlock(blocks)).toBeNull();
  });
});
