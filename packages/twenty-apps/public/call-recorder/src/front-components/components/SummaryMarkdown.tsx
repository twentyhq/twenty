import styled from '@emotion/styled';
import { useMemo } from 'react';

import { SummaryInlineSegments } from 'src/front-components/components/SummaryInlineSegments';
import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';
import { parseSummaryMarkdownBlocks } from 'src/front-components/utils/parse-summary-markdown-blocks.util';

const TOP_LEVEL_HEADING_MAX = 2;

const StyledSummary = styled.div`
  color: ${recordingThemeCssVariables.font.colorSecondary};
  display: flex;
  flex-direction: column;
  font-family: ${recordingThemeCssVariables.font.family};
  font-size: ${recordingThemeCssVariables.font.sizeSm};
  gap: ${recordingThemeCssVariables.spacing[2]};
  line-height: 1.5;
`;

const StyledHeading = styled.h3<{ $isTopLevel: boolean }>`
  color: ${recordingThemeCssVariables.font.colorPrimary};
  font-size: ${({ $isTopLevel }) =>
    $isTopLevel
      ? recordingThemeCssVariables.font.sizeMd
      : recordingThemeCssVariables.font.sizeSm};
  font-weight: ${recordingThemeCssVariables.font.weightMedium};
  margin: 0;
  margin-top: ${recordingThemeCssVariables.spacing[1]};
`;

const StyledParagraph = styled.p`
  margin: 0;
`;

const StyledList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${recordingThemeCssVariables.spacing[1]};
  margin: 0;
  padding-left: ${recordingThemeCssVariables.spacing[3]};
`;

type SummaryMarkdownProps = {
  markdown: string;
};

export const SummaryMarkdown = ({ markdown }: SummaryMarkdownProps) => {
  const blocks = useMemo(
    () => parseSummaryMarkdownBlocks(markdown),
    [markdown],
  );

  return (
    <StyledSummary>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <StyledHeading
              key={index}
              $isTopLevel={block.level <= TOP_LEVEL_HEADING_MAX}
            >
              <SummaryInlineSegments segments={block.segments} />
            </StyledHeading>
          );
        }

        if (block.type === 'list') {
          return (
            <StyledList key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <SummaryInlineSegments segments={item} />
                </li>
              ))}
            </StyledList>
          );
        }

        return (
          <StyledParagraph key={index}>
            <SummaryInlineSegments segments={block.segments} />
          </StyledParagraph>
        );
      })}
    </StyledSummary>
  );
};
