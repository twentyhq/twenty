import styled from '@emotion/styled';
import { RadioGroup } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { CALL_RECORDER_STYLE_OPTIONS } from 'src/constants/call-recorder-style-options';
import { CameraTileStyleOption } from 'src/front-components/components/CameraTileStyleOption';
import { type CallRecorderStyle } from 'src/logic-functions/types/call-recorder-style.type';

const TWO_COLUMN_MAX_WIDTH = '560px';

const StyledChoices = styled.div`
  && {
    display: grid;
    gap: ${() => themeCssVariables.spacing[4]};
    grid-template-columns: repeat(4, minmax(0, 1fr));
    width: 100%;
  }

  @media (max-width: ${TWO_COLUMN_MAX_WIDTH}) {
    && {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`;

type CameraTileStylePickerProps = {
  labelId: string;
  value: CallRecorderStyle;
  onChange: (style: CallRecorderStyle) => void;
};

export const CameraTileStylePicker = ({
  labelId,
  value,
  onChange,
}: CameraTileStylePickerProps) => (
  <RadioGroup
    orientation="horizontal"
    render={<StyledChoices />}
    aria-labelledby={labelId}
    value={value}
    onValueChange={onChange}
  >
    {CALL_RECORDER_STYLE_OPTIONS.map((option) => (
      <CameraTileStyleOption
        key={option.value}
        style={option.value}
        label={option.label}
      />
    ))}
  </RadioGroup>
);
