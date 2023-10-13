import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconCopy, IconLink } from '@/ui/Display/Icon';
import { useSnackBar } from '@/ui/Feedback/Snack Bar/hooks/useSnackBar';
import { Button } from '@/ui/Input/Button/components/Button';
import { TextInput } from '@/ui/Input/components/TextInput';

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
  const theme = useTheme();

  const { enqueueSnackBar } = useSnackBar();

  return (
    <StyledContainer>
      <StyledLinkContainer>
        <TextInput value={inviteLink} disabled fullWidth />
      </StyledLinkContainer>
      <Button
        Icon={IconLink}
        variant="primary"
        accent="blue"
        title="Copy link"
        onClick={() => {
          enqueueSnackBar('Link copied to clipboard', {
            variant: 'success',
            icon: <IconCopy size={theme.icon.size.md} />,
            duration: 2000,
          });
          navigator.clipboard.writeText(inviteLink);
        }}
      />
    </StyledContainer>
  );
};
