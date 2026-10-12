import { useAuth } from '@/auth/hooks/useAuth';
import { Trans } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';

export const WorkspaceSelectionFooter = () => {
  const { signOut } = useAuth();

  return (
    <Button variant="link" onClick={signOut}>
      <Trans>Log out</Trans>
    </Button>
  );
};
