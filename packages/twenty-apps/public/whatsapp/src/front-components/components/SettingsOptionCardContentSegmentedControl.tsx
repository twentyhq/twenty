import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { isDefined } from 'twenty-sdk/utils';
import {
  SegmentedControl,
  type SegmentedControlOption,
} from 'twenty-ui/components/input';
import { type IconComponent } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  OverflowingTextWithTooltip,
  Text,
} from 'twenty-ui/primitives/typography';

import {
  StyledSettingsCardControlContainer,
  StyledSettingsCardIcon,
  StyledSettingsCardRow,
  StyledSettingsCardTextContainer,
} from 'src/front-components/components/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from 'src/front-components/components/SettingsOptionIconCustomizer';

// The control cannot shrink, so on a narrow card it moves under its label
const StyledWrappingRow = styled(StyledSettingsCardRow)`
  flex-wrap: wrap;
`;

const StyledLabel = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 12rem;
  gap: ${() => themeCssVariables.spacing[3]};
  min-width: 0;
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
    <Card.Content>
      <StyledWrappingRow>
        <StyledLabel>
          {isDefined(Icon) && (
            <StyledSettingsCardIcon>
              <SettingsOptionIconCustomizer Icon={Icon} />
            </StyledSettingsCardIcon>
          )}
          <StyledSettingsCardTextContainer>
            <Text id={titleId} weight="medium" color="primary">
              {title}
            </Text>
            {isNonEmptyString(description) && (
              <Text size="sm" color="secondary">
                <OverflowingTextWithTooltip text={description} />
              </Text>
            )}
          </StyledSettingsCardTextContainer>
        </StyledLabel>
        <StyledSettingsCardControlContainer>
          <SegmentedControl
            aria-labelledby={titleId}
            size="sm"
            options={options}
            value={value}
            onValueChange={onChange}
          />
        </StyledSettingsCardControlContainer>
      </StyledWrappingRow>
    </Card.Content>
  );
};
