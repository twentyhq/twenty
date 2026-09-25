import { AuthorizeActionButtons } from '@/applications/components/AuthorizeActionButtons';
import { type FrontComponentMediaPermissionRequest } from '@/front-components/media-session/types/FrontComponentMediaPermissionRequest';
import { buildApplicationCapabilitySummary } from '@/marketplace/utils/buildApplicationCapabilitySummary';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { MainButton } from 'twenty-ui/components';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { GrantApplicationCapabilitiesDocument } from '~/generated-metadata/graphql';

type FrontComponentMediaPermissionModalProps = {
  applicationId: string;
  applicationName: string;
  modalInstanceId: string;
  request: FrontComponentMediaPermissionRequest;
};

const StyledContent = styled.div`
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledPermission = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const FrontComponentMediaPermissionModal = ({
  applicationId,
  applicationName,
  modalInstanceId,
  request,
}: FrontComponentMediaPermissionModalProps) => {
  const canManageApps = useHasPermissionFlag(PermissionFlagType.APPLICATIONS);
  const [grantCapabilities, { loading }] = useMutation(
    GrantApplicationCapabilitiesDocument,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    if (loading) {
      return;
    }

    request.resolve(null);
  };

  const handleAuthorize = async () => {
    if (!canManageApps || request.abortSignal.aborted || loading) {
      return;
    }

    setErrorMessage(null);

    try {
      const { data } = await grantCapabilities({
        variables: {
          input: { applicationId, capabilities: request.capabilities },
        },
      });

      if (request.abortSignal.aborted) {
        return;
      }

      if (!isDefined(data)) {
        throw new Error(t`Could not grant media access. Please try again.`);
      }

      request.resolve(data.grantApplicationCapabilities.grantedCapabilities);
    } catch {
      setErrorMessage(t`Could not grant media access. Please try again.`);
    }
  };

  return (
    <DialogInstance
      dialogId={modalInstanceId}
      dismissible={!loading}
      onClose={handleClose}
      renderInDocumentBody
    >
      {({ container, backdrop, viewportProps, onKeyDown }) => (
        <Dialog.Popup
          {...{ container, backdrop, viewportProps, onKeyDown }}
          size="sm"
        >
          <StyledContent>
            <Dialog.Title>{t`Allow media access for ${applicationName}?`}</Dialog.Title>
            {buildApplicationCapabilitySummary(request.capabilities).map(
              ({ Icon, label }) => (
                <StyledPermission key={label}>
                  <Icon size={16} />
                  {label}
                </StyledPermission>
              ),
            )}
            <div>{t`This grants access to this app for everyone in your workspace.`}</div>
            {!canManageApps && (
              <div>{t`Only members who can manage apps can grant access. Ask your workspace administrator.`}</div>
            )}
            {isDefined(errorMessage) && <div role="alert">{errorMessage}</div>}
            {canManageApps ? (
              <AuthorizeActionButtons
                onAuthorize={() => void handleAuthorize()}
                onCancel={handleClose}
                isLoading={loading}
              />
            ) : (
              <MainButton
                onClick={handleClose}
                fullWidth
              >{t`Close`}</MainButton>
            )}
          </StyledContent>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
