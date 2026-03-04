import styled from '@emotion/styled';
import Markdown from 'react-markdown';
import { isDefined } from 'twenty-shared/utils';

type SummaryViewerProps = {
  markdown: string | null | undefined;
};

const StyledSummaryCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
`;

const StyledSummaryContent = styled.div`
  line-height: 1.7;
  padding: 20px 24px;
  font-size: 13.5px;
  color: #333;
  max-height: 500px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.12);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 1.2em;
    margin-bottom: 0.5em;
    color: #1a1a1a;
    font-weight: 600;

    &:first-child {
      margin-top: 0;
    }
  }

  p {
    margin: 0.6em 0;
  }

  strong {
    color: #1a1a1a;
    font-weight: 600;
  }

  ul,
  ol {
    padding-left: 1.5em;
    margin: 0.5em 0;
  }

  code {
    background-color: rgba(0, 0, 0, 0.04);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.88em;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }

  pre {
    background-color: #f6f8fa;
    padding: 14px 16px;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid rgba(0, 0, 0, 0.06);
  }

  blockquote {
    border-left: 3px solid #d0d7de;
    margin: 0.6em 0;
    padding-left: 1em;
    color: #57606a;
  }
`;

export const SummaryViewer = ({ markdown }: SummaryViewerProps) => {
  if (!isDefined(markdown) || markdown.trim().length === 0) {
    return;
  }

  return (
    <StyledSummaryCard>
      <StyledSummaryContent>
        <Markdown>{markdown}</Markdown>
      </StyledSummaryContent>
    </StyledSummaryCard>
  );
};
