import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { StyledNavigationDrawerAttentionDot } from '@/navigation/components/StyledNavigationDrawerAttentionDot';
import { type NavigationDrawerAttention } from '@/navigation/types/NavigationDrawerAttention';

const navigationButtonClassName = css`
  block-size: ${themeCssVariables.spacing[10]};
  color: ${themeCssVariables.grayScale.gray10};
  inline-size: ${themeCssVariables.spacing[10]};

  &[aria-current='page'] {
    background: ${themeCssVariables.background.transparent.medium};
  }
`;

const navigationIconClassName = css`
  block-size: calc(${themeCssVariables.icon.size.lg} * 1px);
  inline-size: calc(${themeCssVariables.icon.size.lg} * 1px);
`;

const StyledIconContainer = styled.span`
  display: inline-flex;
  position: relative;
`;

type MobileNavigationBarItemProps = {
  item: {
    label: string;
    Icon: IconComponent;
    attention?: NavigationDrawerAttention | null;
    onClick: () => void;
  };
  isActive: boolean;
  isHidden: boolean;
};

export const MobileNavigationBarItem = ({
  item: { label, Icon, attention, onClick },
  isActive,
  isHidden,
}: MobileNavigationBarItemProps) => {
  const { t } = useLingui();

  return (
    <IconButton
      className={navigationButtonClassName}
      variant="ghost"
      shape="round"
      aria-label={
        isDefined(attention) ? t`${label}, needs your attention` : label
      }
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
      tabIndex={isHidden ? -1 : 0}
    >
      <StyledIconContainer>
        <Icon className={navigationIconClassName} aria-hidden />
        {isDefined(attention) && (
          <StyledNavigationDrawerAttentionDot data-attention={attention} />
        )}
      </StyledIconContainer>
    </IconButton>
  );
};
