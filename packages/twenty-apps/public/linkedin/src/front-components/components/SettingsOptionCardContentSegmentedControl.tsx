import styled from '@emotion/styled';
import { useId } from 'react';
import {
  SegmentedControl,
  type SegmentedControlOption,
} from 'twenty-ui/components/input';
import { type IconComponent } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from 'src/front-components/components/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from 'src/front-components/components/SettingsOptionIconCustomizer';

const StyledControlContainer = styled.div`
  flex-shrink: 0;
  margin-left: auto;
`;

type SettingsOptionCardContentSegmentedControlProps<TValue extends string> = {
  Icon?: IconComponent;
  title: string;
  description?: string;
  options: SegmentedControlOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
};

export const SettingsOptionCardContentSegmentedControl = <
  TValue extends string,
>({
  Icon,
  title,
  description,
  options,
  value,
  onChange,
}: SettingsOptionCardContentSegmentedControlProps<TValue>) => {
  const titleId = useId();

  return (
    <StyledSettingsCardContent>
      {Icon && (
        <StyledSettingsCardIcon>
          <SettingsOptionIconCustomizer Icon={Icon} />
        </StyledSettingsCardIcon>
      )}
      <StyledSettingsCardTextContainer>
        <StyledSettingsCardTitle id={titleId}>{title}</StyledSettingsCardTitle>
        {description && (
          <StyledSettingsCardDescription>
            <OverflowingTextWithTooltip text={description} />
          </StyledSettingsCardDescription>
        )}
      </StyledSettingsCardTextContainer>
      <StyledControlContainer>
        <SegmentedControl
          aria-labelledby={titleId}
          size="sm"
          options={options}
          value={value}
          onValueChange={onChange}
        />
      </StyledControlContainer>
    </StyledSettingsCardContent>
  );
};
