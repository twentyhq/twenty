import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { Button } from '@/ui/components/buttons/Button';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { IconCheck, IconLink } from '@/ui/icons';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const StyledLinkContainer = styled.div`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

type OwnProps = {
  inviteLink: string;
};

export function WorkspaceInviteLink({ inviteLink }: OwnProps) {
  const theme = useTheme();
  const [isCopied, setIsCopied] = useState(false);
  return (
    <StyledContainer>
      <StyledLinkContainer>
        <TextInput value={inviteLink} disabled fullWidth />
      </StyledLinkContainer>
      <Button
        icon={
          isCopied ? (
            <IconCheck size={theme.icon.size.md} />
          ) : (
            <IconLink size={theme.icon.size.md} />
          )
        }
        variant="primary"
        title={isCopied ? 'Copied' : 'Copy link'}
        onClick={() => {
          setIsCopied(true);
          navigator.clipboard.writeText(inviteLink);
        }}
      />
    </StyledContainer>
  );
}
