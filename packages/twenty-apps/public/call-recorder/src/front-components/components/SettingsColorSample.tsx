import styled from '@emotion/styled';
import { ColorSample, type ColorSampleProps } from 'twenty-ui/data-display';

const StyledContainer = styled.span`
  display: flex;
`;

export const SettingsColorSample = (props: ColorSampleProps) => (
  <StyledContainer>
    <ColorSample {...props} />
  </StyledContainer>
);
