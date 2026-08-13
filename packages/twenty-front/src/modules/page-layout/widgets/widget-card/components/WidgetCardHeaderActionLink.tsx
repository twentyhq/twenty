import { styled } from '@linaria/react';
import { Link } from 'react-router-dom';
import { type IconComponent } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';

const StyledLinkContainer = styled.div`
  display: flex;

  > * {
    text-decoration: none;
  }
`;

type WidgetCardHeaderActionLinkProps = {
  Icon: IconComponent;
  label: string;
  to: string;
};

// Same nesting as WidgetActionFieldSeeAll; swaps to LightIconButton's `to`
// prop once it lands so the icon renders inside a plain anchor.
export const WidgetCardHeaderActionLink = ({
  Icon,
  label,
  to,
}: WidgetCardHeaderActionLinkProps) => (
  <StyledLinkContainer>
    <Link to={to} aria-label={label} title={label}>
      <LightIconButton Icon={Icon} accent="tertiary" size="small" />
    </Link>
  </StyledLinkContainer>
);
