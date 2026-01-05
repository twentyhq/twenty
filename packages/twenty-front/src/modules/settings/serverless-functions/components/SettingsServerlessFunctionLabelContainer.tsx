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

type SettingsServerlessFunctionLabelContainerProps = {
  value: string;
  onChange: (value: string) => void;
};

export const SettingsServerlessFunctionLabelContainer = ({
  value,
  onChange,
}: SettingsServerlessFunctionLabelContainerProps) => {
  return (
    <StyledHeaderTitle>
      <TitleInput
        instanceId="serverless-function-name-input"
        sizeVariant="md"
        value={value}
        onChange={onChange}
        placeholder={t`Function name`}
      />
    </StyledHeaderTitle>
  );
};
