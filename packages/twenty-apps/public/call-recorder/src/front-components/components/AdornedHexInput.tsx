import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
`;

const StyledAdornmentContainer = styled.div`
  align-items: center;
  background-color: ${() => themeCssVariables.background.transparent.light};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-bottom-left-radius: ${() => themeCssVariables.border.radius.md};
  border-right: none;
  border-top-left-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  height: 32px;
  padding: ${() => themeCssVariables.spacing[2]};
`;

const StyledSwatch = styled.div`
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  height: 16px;
  width: 16px;
`;

const StyledAdornedInput = styled(StyledSettingsTextInput)`
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
`;

type AdornedHexInputProps = {
  id: string;
  value: string;
  swatchColor: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export const AdornedHexInput = ({
  id,
  value,
  swatchColor,
  onChange,
  onBlur,
}: AdornedHexInputProps) => (
  <StyledContainer>
    <StyledAdornmentContainer>
      <StyledSwatch style={{ backgroundColor: swatchColor }} />
    </StyledAdornmentContainer>
    <StyledAdornedInput
      id={id}
      type="text"
      autoComplete="off"
      placeholder="#1d1d1d"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
    />
  </StyledContainer>
);
