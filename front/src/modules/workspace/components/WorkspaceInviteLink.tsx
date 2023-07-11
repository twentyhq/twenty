import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { Button } from '@/ui/components/buttons/Button';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { IconLink } from '@/ui/icons';

const CopyLinkContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const LinkContainer = styled.div`
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
    <CopyLinkContainer>
      <LinkContainer>
        <TextInput value={inviteLink} disabled fullWidth />
      </LinkContainer>
      <Button
        icon={<IconLink size={theme.icon.size.md} />}
        variant="primary"
        title={isCopied ? 'Copied' : 'Copy link'}
        disabled={isCopied}
        onClick={() => {
          setIsCopied(true);
          navigator.clipboard.writeText(inviteLink);
        }}
      />
    </CopyLinkContainer>
  );
}
