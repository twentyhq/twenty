import { useLazyQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconCopy } from 'twenty-ui/icon';
import { GetWorkspaceInvitationLinkDocument } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

type WorkspaceInvitationCopyLinkButtonProps = {
  appTokenId: string;
};

export const WorkspaceInvitationCopyLinkButton = ({
  appTokenId,
}: WorkspaceInvitationCopyLinkButtonProps) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  const [getWorkspaceInvitationLink] = useLazyQuery(
    GetWorkspaceInvitationLinkDocument,
  );

  const handleClick = () => {
    const invitationLink = getWorkspaceInvitationLink({
      variables: { appTokenId },
    }).then(({ data }) => {
      if (!isDefined(data)) {
        throw new Error('Invitation link not found');
      }

      return data.getWorkspaceInvitationLink;
    });

    copyToClipboard(invitationLink, t`Link copied to clipboard`);
  };

  return (
    <IconButton
      aria-label={t`Copy invitation link`}
      onClick={handleClick}
      variant="ghost"
      size="md"
    >
      <IconCopy />
    </IconButton>
  );
};
