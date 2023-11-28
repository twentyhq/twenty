import styled from '@emotion/styled';

import { TextInput } from '@/ui/input/components/TextInput';
import { ThemeColor } from '@/ui/theme/constants/colors';

export type SettingsObjectFieldSelectFormValues = {
  color: ThemeColor;
  text: string;
}[];

type SettingsObjectFieldSelectFormProps = {
  onChange: (values: SettingsObjectFieldSelectFormValues) => void;
  values?: SettingsObjectFieldSelectFormValues;
};

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  display: block;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  text-transform: uppercase;
`;

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StyledOptionInput = styled(TextInput)`
  & input {
    height: ${({ theme }) => theme.spacing(2)};
  }
`;

export const SettingsObjectFieldSelectForm = ({
  onChange,
  values = [],
}: SettingsObjectFieldSelectFormProps) => {
  return (
    <div>
      <StyledLabel>Options</StyledLabel>
      <StyledInputsContainer>
        {values.map((value, index) => (
          <StyledOptionInput
            value={value.text}
            onChange={(text) => {
              const nextValues = [...values];
              nextValues.splice(index, 1, { ...values[index], text });
              onChange(nextValues);
            }}
          />
        ))}
      </StyledInputsContainer>
    </div>
  );
};
