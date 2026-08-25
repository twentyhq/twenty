import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { FirefliesBackfillSection } from 'src/front-components/components/FirefliesBackfillSection';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
`;

export const FirefliesSettings = () => (
  <StyledContainer>
    <FirefliesBackfillSection />
  </StyledContainer>
);
