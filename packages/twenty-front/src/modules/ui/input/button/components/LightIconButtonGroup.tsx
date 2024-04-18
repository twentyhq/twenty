import { MouseEvent } from 'react';
import styled from '@emotion/styled';
import { IconComponent } from 'twenty-ui';

import { LightIconButton, LightIconButtonProps } from './LightIconButton';

const StyledLightIconButtonGroupContainer = styled.div`
  display: inline-flex;
  gap: 2px;
`;

export type LightIconButtonGroupProps = Pick<
  LightIconButtonProps,
  'className' | 'size'
> & {
  iconButtons: {
    Icon: IconComponent;
    onClick?: (event: MouseEvent<any>) => void;
    disabled?: boolean;
  }[];
};

export const LightIconButtonGroup = ({
  iconButtons,
  size,
  className,
}: LightIconButtonGroupProps) => (
  <StyledLightIconButtonGroupContainer className={className}>
    {iconButtons.map(({ Icon, onClick }, index) => {
      return (
        <LightIconButton
          key={`light-icon-button-${index}`}
          Icon={Icon}
          disabled={!onClick}
          onClick={onClick}
          size={size}
        />
      );
    })}
  </StyledLightIconButtonGroupContainer>
);
