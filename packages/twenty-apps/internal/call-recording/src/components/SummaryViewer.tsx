import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

type SummaryViewerProps = {
  markdown: string | null | undefined;
};

const StyledSummaryContainer = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
  padding: 16px;
  font-size: 14px;
  color: #333;
  max-height: 600px;
  overflow-y: auto;
`;

export const SummaryViewer = ({ markdown }: SummaryViewerProps) => {
  if (!isDefined(markdown) || markdown.trim().length === 0) {
    return;
  }

  return <StyledSummaryContainer>{markdown}</StyledSummaryContainer>;
};
