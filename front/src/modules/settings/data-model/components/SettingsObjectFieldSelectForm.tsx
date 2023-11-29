import styled from '@emotion/styled';

import { IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { mainColorNames, ThemeColor } from '@/ui/theme/constants/colors';

import { SettingsObjectFieldSelectFormOption } from '../types/SettingsObjectFieldSelectFormOption';

import { SettingsObjectFieldSelectFormOptionRow } from './SettingsObjectFieldSelectFormOptionRow';

export type SettingsObjectFieldSelectFormValues =
  SettingsObjectFieldSelectFormOption[];

type SettingsObjectFieldSelectFormProps = {
  onChange: (values: SettingsObjectFieldSelectFormValues) => void;
  values: SettingsObjectFieldSelectFormValues;
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

const StyledButton = styled(Button)`
  border-bottom: 0;
  border-left: 0;
  border-radius: 0;
  border-right: 0;
  justify-content: center;
  text-align: center;
`;

const getNextColor = (currentColor: ThemeColor) => {
  const currentColorIndex = mainColorNames.findIndex(
    (color) => color === currentColor,
  );
  const nextColorIndex = (currentColorIndex + 1) % mainColorNames.length;
  return mainColorNames[nextColorIndex];
};

export const SettingsObjectFieldSelectForm = ({
  onChange,
  values,
}: SettingsObjectFieldSelectFormProps) => {
  return (
    <>
      <StyledContainer>
        <StyledLabel>Options</StyledLabel>
        <StyledRows>
          {values.map((option, index) => (
            <SettingsObjectFieldSelectFormOptionRow
              key={index}
              isDefault={option.isDefault}
              onChange={(nextOption) => {
                const hasDefaultOptionChanged =
                  !option.isDefault && nextOption.isDefault;
                const nextOptions = hasDefaultOptionChanged
                  ? values.map((value) => ({ ...value, isDefault: false }))
                  : [...values];

                nextOptions.splice(index, 1, nextOption);

                onChange(nextOptions);
              }}
              onRemove={
                values.length > 1
                  ? () => {
                      const nextOptions = [...values];
                      nextOptions.splice(index, 1);
                      onChange(nextOptions);
                    }
                  : undefined
              }
              option={option}
            />
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
              label: `Option ${values.length + 1}`,
            },
          ])
        }
      />
    </>
  );
};
