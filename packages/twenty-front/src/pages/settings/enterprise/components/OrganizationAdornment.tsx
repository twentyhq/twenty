import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconLock } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { billingState } from '@/client-config/states/billingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledPill = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 40px;
  color: ${themeCssVariables.font.color.tertiary};
  display: inline-flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledPillLink = styled(Link)`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 40px;
  color: ${themeCssVariables.font.color.tertiary};
  display: inline-flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  text-decoration: none;

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
    color: ${themeCssVariables.font.color.secondary};
  }
`;

const OrganizationAdornmentContent = () => (
  <>
    <IconLock size={12} />
    {t`Organization`}
  </>
);

export const OrganizationAdornment = () => {
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled === true;

  if (isBillingEnabled) {
    return (
      <StyledPillLink to={getSettingsPath(SettingsPath.BillingPlans)}>
        <OrganizationAdornmentContent />
      </StyledPillLink>
    );
  }

  return (
    <StyledPill>
      <OrganizationAdornmentContent />
    </StyledPill>
  );
};
