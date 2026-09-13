import { styled } from '@linaria/react';
import { RadioGroup } from 'twenty-ui/input';
import { SettingsRadioCard } from '@/settings/components/SettingsRadioCard';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRadioCardContainer = styled.div`
  display: flex;
  flex-direction: row;
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
    <RadioGroup
      value={value}
      onValueChange={onChange}
      render={<StyledRadioCardContainer />}
    >
      {options.map((option) => (
        <SettingsRadioCard
          key={option.value}
          value={option.value}
          title={option.title}
          description={option.description}
          Icon={option.Icon}
        />
      ))}
    </RadioGroup>
  );
};
