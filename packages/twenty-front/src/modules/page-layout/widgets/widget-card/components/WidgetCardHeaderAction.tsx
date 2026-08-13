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
  const actionButton = (
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

  if (isDefined(headerAction.to) && !headerAction.disabled) {
    return (
      <StyledActionLink to={headerAction.to}>{actionButton}</StyledActionLink>
    );
  }

  return actionButton;
};
