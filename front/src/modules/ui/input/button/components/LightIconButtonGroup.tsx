import { MouseEvent } from 'react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import {
  LightIconButton,
  LightIconButtonProps,
} from '@/ui/input/button/components/LightIconButton';

const StyledLightIconButtonGroupContainer = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
`;

export type LightIconButtonGroupProps = Pick<
  LightIconButtonProps,
  'accent' | 'active' | 'size' | 'focus'
> & {
  iconButtons: {
    Icon: IconComponent;
    onClick?: (event: MouseEvent<any>) => void;
  }[];
};

export const LightIconButtonGroup = ({
  accent,
  iconButtons,
  size,
}: LightIconButtonGroupProps) => (
  <StyledLightIconButtonGroupContainer>
    {iconButtons.map(({ Icon, onClick }) => {
      return (
        <LightIconButton
          accent={accent}
          Icon={Icon}
          onClick={onClick}
          size={size}
        />
      );
    })}
  </StyledLightIconButtonGroupContainer>
);
