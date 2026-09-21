import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsColorSample } from 'src/front-components/components/SettingsColorSample';
import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';

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

const StyledAdornedInput = styled(StyledSettingsTextInput)`
  border-bottom-left-radius: 0;
  border-left: none;
  border-top-left-radius: 0;
`;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  width: 100%;

  &:focus-within ${StyledAdornmentContainer} {
    border-color: ${() => themeCssVariables.color.blue};
  }
`;

type AdornedHexInputProps = {
  id: string;
  value: string;
  swatchColor: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
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
      <SettingsColorSample colorName="gray" color={swatchColor} />
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
