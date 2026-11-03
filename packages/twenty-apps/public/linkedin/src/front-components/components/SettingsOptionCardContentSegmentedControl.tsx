import styled from '@emotion/styled';
import { useId } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

import {
  SegmentedControl,
  type SegmentedControlOption,
} from 'src/front-components/components/SegmentedControl';
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

type SettingsOptionCardContentSegmentedControlProps<
  TValue extends string | number,
> = {
  Icon?: IconComponent;
  title: string;
  description?: string;
  options: SegmentedControlOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
};

export const SettingsOptionCardContentSegmentedControl = <
  TValue extends string | number,
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
          options={options}
          value={value}
          aria-labelledby={titleId}
          onChange={onChange}
        />
      </StyledControlContainer>
    </StyledSettingsCardContent>
  );
};
