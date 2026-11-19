import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/hooks/useConditionalAvailabilityEditorContext';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

const StyledLink = styled(Link)`
  color: inherit;
  text-decoration: underline;
`;

type ConditionalAvailabilityPermissionsLinkProps = {
  children: ReactNode;
};

export const ConditionalAvailabilityPermissionsLink = ({
  children,
}: ConditionalAvailabilityPermissionsLinkProps) => {
  const { hasRolesPermission } = useConditionalAvailabilityEditorContext();

  if (!hasRolesPermission) {
    return children;
  }

  return (
    <StyledLink to={getSettingsPath(SettingsPath.Roles)}>{children}</StyledLink>
  );
};
