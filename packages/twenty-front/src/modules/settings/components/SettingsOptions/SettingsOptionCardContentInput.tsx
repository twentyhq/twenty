import {
  StyledSettingsOptionCardContent,
  StyledSettingsOptionCardDescription,
  StyledSettingsOptionCardIcon,
  StyledSettingsOptionCardTitle,
} from '@/settings/components/SettingsOptions/SettingsOptionCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useState } from 'react';
import { type IconComponent } from 'twenty-ui/display';

const StyledInputContainer = styled.div`
  width: 80px;
`;

const StyledSettingsOptionCardContentInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

type SettingsOptionCardContentInputProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
  disabled?: boolean;
  value: string;
  onBlur: (value: string) => void;
  placeholder?: string;
};

export const SettingsOptionCardContentInput = ({
  Icon,
  title,
  description,
  disabled = false,
  value: initialValue,
  onBlur,
  placeholder,
}: SettingsOptionCardContentInputProps) => {
  const [value, setValue] = useState(initialValue);

  const handleBlur = () => {
    onBlur(value);
  };

  return (
    <StyledSettingsOptionCardContent disabled={disabled}>
      {Icon && (
        <StyledSettingsOptionCardIcon>
          <SettingsOptionIconCustomizer Icon={Icon} />
        </StyledSettingsOptionCardIcon>
      )}
      <StyledSettingsOptionCardContentInfo>
        <StyledSettingsOptionCardTitle>{title}</StyledSettingsOptionCardTitle>
        {description && (
          <StyledSettingsOptionCardDescription>
            {description}
          </StyledSettingsOptionCardDescription>
        )}
      </StyledSettingsOptionCardContentInfo>
      <StyledInputContainer>
        <TextInput
          value={value}
          onChange={setValue}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          fullWidth
        />
      </StyledInputContainer>
    </StyledSettingsOptionCardContent>
  );
};
