import styled from '@emotion/styled';
import { Fragment } from 'react';

import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';
import { type SummaryInlineSegment } from 'src/front-components/types/summary-inline-segment.type';

const StyledBold = styled.strong`
  color: ${recordingThemeCssVariables.font.colorPrimary};
  font-weight: ${recordingThemeCssVariables.font.weightMedium};
`;

type SummaryInlineSegmentsProps = {
  segments: SummaryInlineSegment[];
};

export const SummaryInlineSegments = ({
  segments,
}: SummaryInlineSegmentsProps) => (
  <>
    {segments.map((segment, index) =>
      segment.isBold ? (
        <StyledBold key={index}>{segment.text}</StyledBold>
      ) : (
        <Fragment key={index}>{segment.text}</Fragment>
      ),
    )}
  </>
);
