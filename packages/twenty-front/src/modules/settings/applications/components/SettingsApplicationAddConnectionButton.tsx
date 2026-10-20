import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsApplicationAddConnectionButtonProps = {
  onClick: () => void;
};

export const SettingsApplicationAddConnectionButton = ({
  onClick,
}: SettingsApplicationAddConnectionButtonProps) => {
  const { t } = useLingui();

  return (
    <StyledFooter>
      <Button
        startIcon={<IconPlus />}
        size="sm"
        onClick={onClick}
        variant="outline"
      >{t`Add connection`}</Button>
    </StyledFooter>
  );
};
