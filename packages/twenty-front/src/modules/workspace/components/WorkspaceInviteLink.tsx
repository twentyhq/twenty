import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { useLingui } from '@lingui/react/macro';
import { IconCopy, IconLink } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const StyledLinkContainer = styled.div`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

type WorkspaceInviteLinkProps = {
  inviteLink: string;
};

export const WorkspaceInviteLink = ({
  inviteLink,
}: WorkspaceInviteLinkProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const { enqueueSuccessSnackBar } = useSnackBar();

  return (
    <StyledContainer data-chromatic="ignore">
      <StyledLinkContainer>
        <TextInput
          instanceId="workspace-invite-link"
          value={inviteLink}
          disabled
          fullWidth
        />
      </StyledLinkContainer>
      <Button
        Icon={IconLink}
        variant="primary"
        accent="blue"
        title={t`Copy link`}
        onClick={() => {
          enqueueSuccessSnackBar({
            message: t`Link copied to clipboard`,
            options: {
              icon: <IconCopy size={theme.icon.size.md} />,
              duration: 2000,
            },
          });
          navigator.clipboard.writeText(inviteLink);
        }}
      />
    </StyledContainer>
  );
};
