import { styled } from '@linaria/react';
import { type IconComponent } from 'twenty-ui/icon';
import { LightIconButtonGroup } from 'twenty-ui/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { AnimatedContainer } from 'twenty-ui/layout';

const StyledButtonContainer = styled.div`
  /* Buttons stay concentric with the frame: its radius minus the 1px border. */
  --light-icon-button-radius: calc(${themeCssVariables.border.radius.md} - 1px);

  border: 1px solid ${themeCssVariables.border.color.strong};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    position: relative;
    right: 7px;
  }
  border-radius: ${themeCssVariables.border.radius.md};
  margin: ${themeCssVariables.spacing[1]};
`;

type RecordTableCellButtonsProps = {
  onClick?: () => void;
  Icon: IconComponent;
}[];

export const RecordTableCellButtons = ({
  buttons,
}: {
  buttons: RecordTableCellButtonsProps;
}) => {
  return (
    <AnimatedContainer>
      <StyledButtonContainer>
        <LightIconButtonGroup size="small" iconButtons={buttons} />
      </StyledButtonContainer>
    </AnimatedContainer>
  );
};
