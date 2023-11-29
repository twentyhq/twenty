import styled from '@emotion/styled';

import { IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';
import { mainColors, ThemeColor } from '@/ui/theme/constants/colors';

export type SettingsObjectFieldSelectFormValues = {
  color: ThemeColor;
  text: string;
}[];

type SettingsObjectFieldSelectFormProps = {
  onChange: (values: SettingsObjectFieldSelectFormValues) => void;
  values?: SettingsObjectFieldSelectFormValues;
};

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  display: block;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: 6px;
  margin-top: ${({ theme }) => theme.spacing(1)};
  text-transform: uppercase;
`;

const StyledRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(1)} 0;
`;

const StyledOptionInput = styled(TextInput)`
  flex: 1 0 auto;

  & input {
    height: ${({ theme }) => theme.spacing(2)};
  }
`;

const StyledButton = styled(Button)`
  border-bottom: 0;
  border-left: 0;
  border-radius: 0;
  border-right: 0;
  justify-content: center;
  text-align: center;
`;

const getNextColor = (currentColor: ThemeColor) => {
  const colors = Object.keys(mainColors) as ThemeColor[];
  const currentColorIndex = colors.findIndex((color) => color === currentColor);
  return colors[(currentColorIndex + 1) % colors.length];
};

export const SettingsObjectFieldSelectForm = ({
  onChange,
  values = [],
}: SettingsObjectFieldSelectFormProps) => {
  return (
    <>
      <StyledContainer>
        <StyledLabel>Options</StyledLabel>
        <StyledRows>
          {values.map((value, index) => (
            <StyledRow>
              <StyledOptionInput
                value={value.text}
                onChange={(text) => {
                  const nextValues = [...values];
                  nextValues.splice(index, 1, { ...values[index], text });
                  onChange(nextValues);
                }}
              />
            </StyledRow>
          ))}
        </StyledRows>
      </StyledContainer>
      <StyledButton
        title="Add option"
        fullWidth
        Icon={IconPlus}
        onClick={() =>
          onChange([
            ...values,
            {
              color: getNextColor(values[values.length - 1].color),
              text: `Option ${values.length + 1}`,
            },
          ])
        }
      />
    </>
  );
};
