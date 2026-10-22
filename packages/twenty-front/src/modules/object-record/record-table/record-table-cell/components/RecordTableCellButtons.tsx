import { AnimatedContainer } from '@/ui/layout/animation/components/internal/AnimatedContainer/AnimatedContainer';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { type IconComponent } from 'twenty-ui/icon';
import { ButtonGroup } from 'twenty-ui/primitives/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';

const StyledButtonContainer = styled.div`
  margin: ${themeCssVariables.spacing[1]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    position: relative;
    right: 7px;
  }
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
        <ButtonGroup aria-label={t`Cell controls`} framed attached={false}>
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
