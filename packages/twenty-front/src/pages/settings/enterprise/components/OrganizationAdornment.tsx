import { t } from '@lingui/core/macro';
import { css, cx } from '@linaria/core';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconLock } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { billingState } from '@/client-config/states/billingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const pillClassName = css`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.tertiary};
  corner-shape: round;
  display: inline-flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const pillLinkClassName = css`
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
  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  if (isBillingEnabled) {
    return (
      <Link
        className={cx(pillClassName, pillLinkClassName)}
        to={getSettingsPath(SettingsPath.BillingPlans)}
      >
        <OrganizationAdornmentContent />
      </Link>
    );
  }

  return (
    <span className={pillClassName}>
      <OrganizationAdornmentContent />
    </span>
  );
};
