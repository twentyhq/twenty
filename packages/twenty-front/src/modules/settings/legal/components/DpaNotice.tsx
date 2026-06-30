import { styled } from '@linaria/react';
import { Info } from 'twenty-ui/feedback';

const StyledFullWidthInfo = styled.div`
  & > * {
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
