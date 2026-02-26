import styled from '@emotion/styled';
import Markdown from 'react-markdown';
import { isDefined } from 'twenty-shared/utils';

type SummaryViewerProps = {
  markdown: string | null | undefined;
};

const StyledSummaryContainer = styled.div`
  line-height: 1.6;
  padding: 16px;
  font-size: 14px;
  color: #333;
  max-height: 600px;
  overflow-y: auto;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 1em;
    margin-bottom: 0.5em;
  }

  p {
    margin: 0.5em 0;
  }

  ul,
  ol {
    padding-left: 1.5em;
    margin: 0.5em 0;
  }

  code {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 0.9em;
  }

  pre {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
  }

  blockquote {
    border-left: 3px solid #ddd;
    margin: 0.5em 0;
    padding-left: 1em;
    color: #666;
  }
`;

export const SummaryViewer = ({ markdown }: SummaryViewerProps) => {
  if (!isDefined(markdown) || markdown.trim().length === 0) {
    return;
  }

  return (
    <StyledSummaryContainer>
      <Markdown>{markdown}</Markdown>
    </StyledSummaryContainer>
  );
};
