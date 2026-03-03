import { styled } from '@linaria/react';
import { SettingsRadioCard } from '@/settings/components/SettingsRadioCard';
import { type IconComponent } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRadioCardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[4]};
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
    <StyledRadioCardContainer role="radiogroup">
      {options.map((option) => (
        <SettingsRadioCard
          key={option.value}
          role="radio"
          value={option.value}
          isSelected={value === option.value}
          handleSelect={onChange}
          title={option.title}
          description={option.description}
          Icon={option.Icon}
          ariaChecked={value === option.value}
        />
      ))}
    </StyledRadioCardContainer>
  );
};
