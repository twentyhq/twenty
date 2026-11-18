import { useQuery } from '@apollo/client/react';
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

  const { data } = useQuery(GetWorkspaceInvitationLinkDocument, {
    variables: { appTokenId },
  });

  const invitationLink = data?.getWorkspaceInvitationLink;

  return (
    <IconButton
      aria-label={t`Copy invitation link`}
      onClick={() => {
        if (!isDefined(invitationLink)) {
          return;
        }

        copyToClipboard(invitationLink, t`Link copied to clipboard`);
      }}
      disabled={!isDefined(invitationLink)}
      variant="ghost"
      size="md"
    >
      <IconCopy />
    </IconButton>
  );
};
