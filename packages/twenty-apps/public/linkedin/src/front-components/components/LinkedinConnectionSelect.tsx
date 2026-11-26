import styled from '@emotion/styled';
import { useId } from 'react';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Select } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { type LinkedinConnectionSummary } from 'src/types/linkedin-connection-summary.type';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.xs};
  font-weight: ${() => themeCssVariables.font.weight.semiBold};
`;

type LinkedinConnectionSelectProps = {
  connections: LinkedinConnectionSummary[];
  selectedConnectionId: string;
  onChange: (connectionId: string) => void;
};

export const LinkedinConnectionSelect = ({
  connections,
  selectedConnectionId,
  onChange,
}: LinkedinConnectionSelectProps) => {
  const labelId = useId();
  const options = connections.map(({ id, name, handle }) => ({
    value: id,
    label: `${name} · ${handle}`,
  }));

  return (
    <StyledContainer>
      <StyledLabel id={labelId}>{t('Connection to configure')}</StyledLabel>
      <Select.Root<string>
        items={options}
        value={selectedConnectionId}
        onValueChange={(value, details) => {
          if (
            details.reason === 'item-press' &&
            isDefined(value) &&
            value !== selectedConnectionId
          ) {
            onChange(value);
          }
        }}
      >
        <Select.Trigger aria-labelledby={labelId}>
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner alignItemWithTrigger={false}>
            <Select.Popup aria-labelledby={labelId}>
              {options.map(({ value, label }) => (
                <Select.Item key={value} value={value}>
                  <Select.ItemText>{label}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </StyledContainer>
  );
};
