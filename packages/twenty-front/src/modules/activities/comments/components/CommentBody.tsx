import styled from '@emotion/styled';
import { isArray } from '@sniptt/guards';
import { Fragment } from 'react';

const StyledMention = styled.span`
  background-color: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.color.blue};
  padding: 0 ${({ theme }) => theme.spacing(1)};
`;

type BlockNoteInlineContent =
  | { type: 'text'; text: string; styles?: Record<string, boolean> }
  | { type: 'link'; href: string; content: BlockNoteInlineContent[] }
  | { type: 'mention'; props: { userId: string; name: string } };

type BlockNoteBlock = {
  id?: string;
  type: string;
  content?: BlockNoteInlineContent[];
  children?: BlockNoteBlock[];
};

type CommentBodyProps = {
  blocknoteContent: string | null;
};

const renderInlineContent = (
  content: BlockNoteInlineContent,
  index: number,
): React.ReactNode => {
  if (content.type === 'text') {
    return <Fragment key={index}>{content.text}</Fragment>;
  }

  if (content.type === 'mention') {
    return (
      <StyledMention key={index}>
        @{content.props?.name || 'Unknown'}
      </StyledMention>
    );
  }

  if (content.type === 'link' && isArray(content.content)) {
    return (
      <a key={index} href={content.href}>
        {content.content.map((c, i) => renderInlineContent(c, i))}
      </a>
    );
  }

  return null;
};

const renderBlock = (block: BlockNoteBlock, index: number): React.ReactNode => {
  if (!block.content || !isArray(block.content)) {
    return null;
  }

  return (
    <div key={block.id || index}>
      {block.content.map((content, i) => renderInlineContent(content, i))}
    </div>
  );
};

export const CommentBody = ({ blocknoteContent }: CommentBodyProps) => {
  if (!blocknoteContent) {
    return null;
  }

  let blocks: BlockNoteBlock[] = [];
  try {
    blocks = JSON.parse(blocknoteContent);
  } catch {
    return <>{blocknoteContent}</>;
  }

  if (!isArray(blocks) || blocks.length === 0) {
    return null;
  }

  return <>{blocks.map((block, index) => renderBlock(block, index))}</>;
};
