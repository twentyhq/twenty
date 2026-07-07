import { styled } from '@linaria/react';

const WELCOME_HALFTONE_URL = '/images/onboarding/welcome-halftone.svg';

const StyledHalftoneImage = styled.img`
  display: block;
  height: auto;
  user-select: none;
  width: 100%;
`;

export const HalftoneLogo = () => (
  <StyledHalftoneImage src={WELCOME_HALFTONE_URL} alt="" draggable={false} />
);
