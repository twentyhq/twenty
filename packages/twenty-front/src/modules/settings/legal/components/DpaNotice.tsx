import { styled } from '@linaria/react';
import { Info } from 'twenty-ui/feedback';

// The shared Info component caps its width at 512px and exposes no width prop;
// on the DPA pages the danger banner should span the full content width to
// match the sections (document preview / table) below it. We override from a
// local wrapper rather than modifying the shared component — the `& > *`
// selector targets Info's single root element without assuming its tag.
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
