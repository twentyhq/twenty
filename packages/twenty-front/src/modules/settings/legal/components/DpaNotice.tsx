import { styled } from '@linaria/react';
import { InlineBanner } from 'twenty-ui/components/feedback';

const StyledFullWidthBanner = styled.div`
  & > * {
    max-width: 100%;
  }
`;

type DpaNoticeProps = {
  text: string;
};

export const DpaNotice = ({ text }: DpaNoticeProps) => (
  <StyledFullWidthBanner>
    <InlineBanner variant="compact" color="danger" message={text} />
  </StyledFullWidthBanner>
);
