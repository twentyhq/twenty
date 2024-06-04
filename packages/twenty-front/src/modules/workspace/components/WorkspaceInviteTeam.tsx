import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconCopy, IconMail, IconSend } from 'twenty-ui';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const StyledLinkContainer = styled.div`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

export const WorkspaceInviteTeam = () => {
  const theme = useTheme();
  const { enqueueSnackBar } = useSnackBar();
  const handleOnClick = () => {
    enqueueSnackBar('Invite link sent to email addresses', {
      variant: SnackBarVariant.Success,
      icon: <IconCopy size={theme.icon.size.md} />,
      duration: 2000,
    });
  };
  return (
    <StyledContainer>
      <StyledLinkContainer>
        <TextInput
          placeholder="tim@apple.com, jony.ive@apple.dev"
          fullWidth
          LeftIcon={IconMail}
        />
      </StyledLinkContainer>
      <Button
        Icon={IconSend}
        variant="primary"
        accent="blue"
        title="Invite"
        onClick={handleOnClick}
      />
    </StyledContainer>
  );
};
