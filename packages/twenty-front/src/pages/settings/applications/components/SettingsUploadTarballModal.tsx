import { styled } from '@linaria/react';
import { useRef } from 'react';

import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { useUploadAppTarball } from '~/modules/marketplace/hooks/useUploadAppTarball';
import { useInstallMarketplaceApp } from '~/modules/marketplace/hooks/useInstallMarketplaceApp';
import { useFindManyApplicationsQuery } from '~/generated-metadata/graphql';
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
  const { t } = useLingui();
  const { closeModal } = useModal();
  const { upload, isUploading } = useUploadAppTarball();
  const { install } = useInstallMarketplaceApp();
  const { refetch } = useFindManyApplicationsQuery();
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

    const uploadResult = await upload(file);

    if (uploadResult.success) {
      const installResult = await install({
        universalIdentifier: uploadResult.universalIdentifier,
      });

      if (installResult) {
        await refetch();
        closeModal(UPLOAD_TARBALL_MODAL_ID);
      }
    }

    if (isDefined(fileInputRef.current)) {
      fileInputRef.current.value = '';
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
      modalVariant="primary"
      dataGloballyPreventClickOutside
      ignoreContainer
    >
      <StyledAppModalTitle>
        <H1Title
          title={t`Upload tarball`}
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledAppModalTitle>
      <StyledAppModalSection
        alignment={SectionAlignment.Center}
        fontColor={SectionFontColor.Primary}
      >
        {t`Select a .tar.gz application package to upload and install.`}
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
        title={t`Cancel`}
        fullWidth
      />
      <StyledAppModalButton
        onClick={handleSelectFile}
        variant="secondary"
        accent="blue"
        title={t`Choose file`}
        disabled={isUploading}
        fullWidth
      />
    </StyledAppModal>
  );
};
