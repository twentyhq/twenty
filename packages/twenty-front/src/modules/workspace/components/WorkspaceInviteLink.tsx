import styled from '@emotion/styled';

import { TextInput } from '@/ui/input/components/TextInput';
import { useLingui } from '@lingui/react/macro';
import { IconLink } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

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

  const { copyToClipboard } = useCopyToClipboard();

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
          copyToClipboard(inviteLink, t`Link copied to clipboard`);
        }}
      />
    </StyledContainer>
  );
};
