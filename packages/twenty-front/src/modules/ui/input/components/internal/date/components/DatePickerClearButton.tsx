import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { IconCalendarX } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[1]};
`;

type DatePickerClearButtonProps = {
  onClear?: () => void;
};

export const DatePickerClearButton = ({
  onClear,
}: DatePickerClearButtonProps) => (
  <StyledContainer>
    <ListItem
      render={<button type="button" />}
      startIcon={<IconCalendarX />}
      onClick={onClear}
    >
      {t`Clear`}
    </ListItem>
  </StyledContainer>
);
