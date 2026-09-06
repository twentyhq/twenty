import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import {
  useColorScheme,
  useFrontComponentId,
} from 'twenty-sdk/front-component';
import { THEME_DARK, THEME_LIGHT } from 'twenty-ui/theme';
import {
  ThemeContext,
  themeCssVariables,
  type ThemeType,
} from 'twenty-ui/theme-constants';

import { InCallSection } from 'src/front-components/components/InCallSection';
import { RecorderSection } from 'src/front-components/components/RecorderSection';
import { TranscriptionSection } from 'src/front-components/components/TranscriptionSection';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
`;

export const CallRecorderSettings = () => {
  const colorScheme = useColorScheme();
  const frontComponentId = useFrontComponentId();

  // twenty-ui components read icon sizes off ThemeContext, and the context
  // default resolves them to var() strings an SVG size attribute cannot use —
  // menu check marks render at their intrinsic size without a real theme here.
  return (
    <ThemeContext.Provider
      value={{
        theme: (colorScheme === 'dark'
          ? THEME_DARK
          : THEME_LIGHT) as unknown as ThemeType,
        colorScheme,
      }}
    >
      <StyledContainer>
        <RecorderSection frontComponentId={frontComponentId} />
        <InCallSection frontComponentId={frontComponentId} />
        <TranscriptionSection frontComponentId={frontComponentId} />
      </StyledContainer>
    </ThemeContext.Provider>
  );
};
