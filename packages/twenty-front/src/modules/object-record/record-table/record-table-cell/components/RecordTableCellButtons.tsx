import { AnimatedContainer } from '@/ui/layout/animation/components/internal/AnimatedContainer/AnimatedContainer';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import { type IconComponent } from 'twenty-ui/icon';
import { ButtonGroup } from 'twenty-ui/primitives/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledButtonContainer = styled.div`
  /* Buttons stay concentric with the frame: its radius minus the 1px border.
     The frame uses sm (not md): on this ~26px control md would exceed 50% of
     the box and clamp to a full squircle, and a scaled full squircle is not a
     uniform offset — the child corners would pull away from the frame. sm
     stays well below the clamp point so radius - inset holds in both modes. */
  --tw-button-radius: calc(${themeCssVariables.border.radius.sm} - 1px);

  border: 1px solid ${themeCssVariables.border.color.strong};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    position: relative;
    right: 7px;
  }
  border-radius: ${themeCssVariables.border.radius.sm};
  margin: ${themeCssVariables.spacing[1]};
`;

type RecordTableCellButtonsProps = {
  onClick?: () => void;
  Icon: IconComponent;
  ariaLabel: string;
}[];

export const RecordTableCellButtons = ({
  buttons,
}: {
  buttons: RecordTableCellButtonsProps;
}) => {
  const { t } = useLingui();

  return (
    <AnimatedContainer>
      <StyledButtonContainer>
        <ButtonGroup aria-label={t`Cell controls`} attached={false}>
          {buttons.map(({ Icon, onClick, ariaLabel }, index) => (
            <LightIconButton
              key={index}
              aria-label={ariaLabel}
              onClick={onClick}
              disabled={!isDefined(onClick)}
            >
              <Icon />
            </LightIconButton>
          ))}
        </ButtonGroup>
      </StyledButtonContainer>
    </AnimatedContainer>
  );
};
