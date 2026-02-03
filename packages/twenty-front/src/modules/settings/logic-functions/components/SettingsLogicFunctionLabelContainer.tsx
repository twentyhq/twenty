import { TitleInput } from '@/ui/input/components/TitleInput';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

const StyledHeaderTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  font-size: ${({ theme }) => theme.font.size.lg};
  width: fit-content;
  max-width: 420px;
  & > input:disabled {
    color: ${({ theme }) => theme.font.color.primary};
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
