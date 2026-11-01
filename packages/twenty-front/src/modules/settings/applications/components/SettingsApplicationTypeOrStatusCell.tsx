import { SettingsApplicationStatusCell } from '@/settings/applications/components/SettingsApplicationStatusCell';
import { type SettingsApplicationStatus } from '@/settings/applications/types/SettingsApplicationStatus';
import { styled } from '@linaria/react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledStatus = styled.span`
  display: inline-flex;
  grid-area: 1 / 1;
  transition: opacity calc(${themeCssVariables.animation.duration.fast} * 1s);
`;

const StyledTypeLabel = styled.span`
  grid-area: 1 / 1;
  opacity: 0;
  transition: opacity calc(${themeCssVariables.animation.duration.fast} * 1s);
`;

const StyledContainer = styled.span`
  align-items: center;
  display: inline-grid;
  justify-items: start;

  &:hover > ${StyledStatus}, a:focus-visible & > ${StyledStatus} {
    opacity: 0;
  }

  &:hover > ${StyledTypeLabel}, a:focus-visible & > ${StyledTypeLabel} {
    opacity: 1;
  }
`;

type SettingsApplicationTypeOrStatusCellProps = {
  typeLabel: string;
  statuses?: SettingsApplicationStatus[];
};

export const SettingsApplicationTypeOrStatusCell = ({
  typeLabel,
  statuses = [],
}: SettingsApplicationTypeOrStatusCellProps) => {
  if (!isNonEmptyArray(statuses)) {
    return <>{typeLabel}</>;
  }

  return (
    <StyledContainer>
      <StyledStatus>
        <SettingsApplicationStatusCell statuses={statuses} />
      </StyledStatus>
      <StyledTypeLabel>{typeLabel}</StyledTypeLabel>
    </StyledContainer>
  );
};
