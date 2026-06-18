import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconArrowBackUp, IconUserCircle } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledThreadBottomBar = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[6]};
  padding-right: ${themeCssVariables.spacing[6]};
  padding-top: ${themeCssVariables.spacing[4]};
`;

export const ThreadBottomBar = () => {
  return (
    <StyledThreadBottomBar>
      <Button
        Icon={IconArrowBackUp}
        title={t`Reply`}
        variant="secondary"
        accent="default"
      />
      <Button
        Icon={IconArrowBackUp}
        title={t`Reply to all`}
        variant="secondary"
        accent="default"
      />
      <Button
        Icon={IconUserCircle}
        title={t`Share`}
        variant="secondary"
        accent="default"
      />
    </StyledThreadBottomBar>
  );
};
