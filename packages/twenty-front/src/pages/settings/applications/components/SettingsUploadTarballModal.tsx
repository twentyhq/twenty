import { styled } from '@linaria/react';
import { useRef } from 'react';

import { FIND_MANY_APPLICATION_REGISTRATIONS } from '@/settings/application-registrations/graphql/queries/findManyApplicationRegistrations';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useApolloClient, useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { INSTALL_APPLICATION } from '~/modules/marketplace/graphql/mutations/installApplication';
import { useUploadAppTarball } from '~/modules/marketplace/hooks/useUploadAppTarball';
import {
  StyledAppModal,
  StyledAppModalButton,
  StyledAppModalSection,
  StyledAppModalTitle,
} from '~/pages/settings/applications/components/SettingsAppModalLayout';

export const UPLOAD_TARBALL_MODAL_ID = 'upload-tarball-modal';

const StyledFileInput = styled.input`
  display: none;
`;

export const SettingsUploadTarballModal = () => {
  const { t: tFn } = useLingui();
  const { closeModal } = useModal();
  const { upload, isUploading } = useUploadAppTarball();
  const [installApplication] = useMutation(INSTALL_APPLICATION);
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const apolloClient = useApolloClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!isDefined(file)) {
      return;
    }

    try {
      const uploadResult = await upload(file);

      if (!uploadResult.success) {
        return;
      }

      const registrationId = uploadResult.registrationId;

      if (isDefined(registrationId)) {
        try {
          await installApplication({
            variables: { appRegistrationId: registrationId },
          });
          enqueueSuccessSnackBar({
            message: t`Application installed successfully.`,
          });
        } catch {
          enqueueErrorSnackBar({
            message: t`Tarball uploaded but installation failed.`,
          });
        }
      }

      await apolloClient.refetchQueries({
        include: [FIND_MANY_APPLICATION_REGISTRATIONS],
      });
      closeModal(UPLOAD_TARBALL_MODAL_ID);
    } finally {
      if (isDefined(fileInputRef.current)) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancel = () => {
    closeModal(UPLOAD_TARBALL_MODAL_ID);
  };

  return (
    <StyledAppModal
      modalId={UPLOAD_TARBALL_MODAL_ID}
      isClosable={true}
      padding="large"
      dataGloballyPreventClickOutside
    >
      <StyledAppModalTitle>
        <H1Title
          title={tFn`Upload tarball`}
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledAppModalTitle>
      <StyledAppModalSection
        alignment={SectionAlignment.Center}
        fontColor={SectionFontColor.Primary}
      >
        {tFn`Select a .tar.gz application package to upload and install.`}
      </StyledAppModalSection>

      <StyledFileInput
        ref={fileInputRef}
        type="file"
        accept=".tar.gz,.tgz"
        onChange={handleFileChange}
      />

      <StyledAppModalButton
        onClick={handleCancel}
        variant="secondary"
        title={tFn`Cancel`}
        fullWidth
      />
      <StyledAppModalButton
        onClick={handleSelectFile}
        variant="secondary"
        accent="blue"
        title={tFn`Choose file`}
        disabled={isUploading}
        fullWidth
      />
    </StyledAppModal>
  );
};
