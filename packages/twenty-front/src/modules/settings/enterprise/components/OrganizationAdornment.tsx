import { t } from '@lingui/core/macro';
import { css, cx } from '@linaria/core';
import { isNonEmptyString } from '@sniptt/guards';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconLock } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { billingState } from '@/client-config/states/billingState';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
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

const iconOnlyPillClassName = css`
  block-size: 24px;
  box-sizing: border-box;
  inline-size: 24px;
  justify-content: center;
  padding: 0;
`;

type OrganizationAdornmentProps = {
  tooltipContent?: string;
  iconOnly?: boolean;
};

export const OrganizationAdornment = ({
  tooltipContent,
  iconOnly = false,
}: OrganizationAdornmentProps) => {
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const label = t`Organization`;
  const className = cx(pillClassName, iconOnly && iconOnlyPillClassName);
  const content = iconOnly ? (
    <IconLock size={16} />
  ) : (
    <>
      <IconLock size={12} />
      {label}
    </>
  );
  const adornment = isBillingEnabled ? (
    <Link
      className={cx(className, pillLinkClassName)}
      to={getSettingsPath(SettingsPath.BillingPlans)}
      aria-label={iconOnly ? label : undefined}
    >
      {content}
    </Link>
  ) : (
    <span
      className={className}
      role={iconOnly ? 'img' : undefined}
      aria-label={iconOnly ? label : undefined}
    >
      {content}
    </span>
  );
  const resolvedTooltipContent =
    tooltipContent ?? (iconOnly ? label : undefined);

  if (!isNonEmptyString(resolvedTooltipContent)) {
    return adornment;
  }

  return (
    <Tooltip
      content={resolvedTooltipContent}
      delay={TooltipDelay.shortDelay}
      side="top"
      maxWidth="260px"
    >
      {adornment}
    </Tooltip>
  );
};
