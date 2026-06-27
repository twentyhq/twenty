import { styled } from '@linaria/react';
import { Info } from 'twenty-ui/feedback';

// The shared Info component caps its width at 512px; on the DPA pages the
// danger banner should span the full content width, matching the page sections
// (document preview / table) below it.
const StyledFullWidthInfo = styled.div`
  & > div {
    max-width: 100%;
  }
`;

type DpaNoticeProps = {
  text: string;
};

export const DpaNotice = ({ text }: DpaNoticeProps) => (
  <StyledFullWidthInfo>
    <Info accent="danger" text={text} />
  </StyledFullWidthInfo>
);
