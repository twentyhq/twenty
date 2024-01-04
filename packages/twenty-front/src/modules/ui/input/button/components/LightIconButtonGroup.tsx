import { MouseEvent } from 'react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';

import { LightIconButton, LightIconButtonProps } from './LightIconButton';

const StyledLightIconButtonGroupContainer = styled.div`
  display: inline-flex;
  gap: 2px;
  padding: 2px;
`;

export type LightIconButtonGroupProps = Pick<
  LightIconButtonProps,
  'className' | 'size'
> & {
  iconButtons: {
    Icon: IconComponent;
    onClick?: (event: MouseEvent<any>) => void;
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
          onClick={onClick}
          size={size}
        />
      );
    })}
  </StyledLightIconButtonGroupContainer>
);
