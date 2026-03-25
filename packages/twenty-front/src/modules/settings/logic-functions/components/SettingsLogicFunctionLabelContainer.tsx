import { TitleInput } from '@/ui/input/components/TitleInput';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeaderTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  max-width: 420px;
  width: fit-content;
  & > input:disabled {
    color: ${themeCssVariables.font.color.primary};
  }
`;

type SettingsLogicFunctionLabelContainerProps = {
  value: string;
  onChange: (value: string) => void;
};

export const SettingsLogicFunctionLabelContainer = ({
  value,
  onChange,
}: SettingsLogicFunctionLabelContainerProps) => {
  return (
    <StyledHeaderTitle>
      <TitleInput
        instanceId="logic-function-name-input"
        sizeVariant="md"
        value={value}
        onChange={onChange}
        placeholder={t`Function name`}
      />
    </StyledHeaderTitle>
  );
};
