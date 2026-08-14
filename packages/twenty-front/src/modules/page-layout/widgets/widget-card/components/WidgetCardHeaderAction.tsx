import { type WidgetHeaderAction } from '@/page-layout/widgets/types/WidgetHeaderInfo';
import { styled } from '@linaria/react';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/input';

const StyledActionLink = styled(Link)`
  display: flex;
  text-decoration: none;
`;

type WidgetCardHeaderActionProps = {
  headerAction: WidgetHeaderAction;
};

export const WidgetCardHeaderAction = ({
  headerAction,
}: WidgetCardHeaderActionProps) => {
  if (isDefined(headerAction.to)) {
    return (
      <StyledActionLink
        aria-label={headerAction.label}
        title={headerAction.label}
        to={headerAction.to}
      >
        <LightIconButton
          Icon={headerAction.Icon}
          accent="tertiary"
          size="small"
        />
      </StyledActionLink>
    );
  }

  return (
    <LightIconButton
      Icon={headerAction.Icon}
      aria-label={headerAction.label}
      title={headerAction.label}
      accent="tertiary"
      size="small"
      onClick={headerAction.onClick}
      disabled={headerAction.disabled}
    />
  );
};
