import styled from '@emotion/styled';
import { IconComponent } from 'twenty-ui';
import { SettingsRadioCard } from '@/settings/components/SettingsRadioCard';

const StyledRadioCardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(4)};
`;

type SettingsRadioCardContainerProps = {
  onChange: (value: string) => void;
  value: string;
  options: Array<{
    value: string;
    title: string;
    description?: string;
    Icon?: IconComponent;
  }>;
};

export const SettingsRadioCardContainer = ({
  options,
  value,
  onChange,
}: SettingsRadioCardContainerProps) => {
  return (
    <StyledRadioCardContainer>
      {options.map((option) => (
        <SettingsRadioCard
          key={option.value}
          value={option.value}
          isSelected={value === option.value}
          handleClick={onChange}
          title={option.title}
          description={option.description}
          Icon={option.Icon}
        />
      ))}
    </StyledRadioCardContainer>
  );
};
