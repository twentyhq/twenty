import { styled } from '@linaria/react';
import { type IconComponent } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { type ThemeColor } from 'twenty-ui/theme';
import { isDefined } from 'twenty-shared/utils';

type SelectDisplayProps = {
  color: ThemeColor | 'transparent';
  label: string;
  Icon?: IconComponent;
};

const StyledSelectTag = styled(Tag)`
  && {
    min-width: fit-content;
  }
`;

export const SelectDisplay = ({ color, label, Icon }: SelectDisplayProps) => (
  <StyledSelectTag
    truncate={false}
    color={color}
    startIcon={isDefined(Icon) ? <Icon /> : undefined}
  >
    {label}
  </StyledSelectTag>
);
