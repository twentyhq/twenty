import styled from '@emotion/styled';
import { IconCheck, IconX } from 'twenty-ui';

import { Select } from '@/ui/input/components/Select';
import { CardContent } from '@/ui/layout/card/components/CardContent';

type SettingsDataModelDefaultValueFormProps = {
  className?: string;
  disabled?: boolean;
  onChange?: (defaultValue: SettingsDataModelDefaultValue) => void;
  value?: SettingsDataModelDefaultValue;
};

export type SettingsDataModelDefaultValue = any;

const StyledContainer = styled(CardContent)`
  padding-bottom: ${({ theme }) => theme.spacing(3.5)};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  display: block;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: 6px;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsDataModelDefaultValueForm = ({
  className,
  disabled,
  onChange,
  value,
}: SettingsDataModelDefaultValueFormProps) => {
  return (
    <StyledContainer>
      <StyledLabel>Default Value</StyledLabel>
      <Select
        className={className}
        fullWidth
        disabled={disabled}
        dropdownId="object-field-default-value-select"
        value={value}
        onChange={(value) => onChange?.(value)}
        options={[
          {
            value: true,
            label: 'True',
            Icon: IconCheck,
          },
          {
            value: false,
            label: 'False',
            Icon: IconX,
          },
        ]}
      />
    </StyledContainer>
  );
};
