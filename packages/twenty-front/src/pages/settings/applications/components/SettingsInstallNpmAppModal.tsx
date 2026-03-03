import { styled } from '@linaria/react';
import { useState } from 'react';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useLingui } from '@lingui/react/macro';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useInstallMarketplaceApp } from '~/modules/marketplace/hooks/useInstallMarketplaceApp';
import { useFindManyApplicationsQuery } from '~/generated-metadata/graphql';
import {
  StyledAppModal,
  StyledAppModalButton,
  StyledAppModalSection,
  StyledAppModalTitle,
} from '~/pages/settings/applications/components/SettingsAppModalLayout';

export const INSTALL_NPM_APP_MODAL_ID = 'install-npm-app-modal';

const StyledInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

export const SettingsInstallNpmAppModal = () => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const { install, isInstalling } = useInstallMarketplaceApp();
  const { refetch } = useFindManyApplicationsQuery();

  const [packageName, setPackageName] = useState('');
  const [version, setVersion] = useState('');

  const isValid = packageName.trim().length > 0;

  const handleInstall = async () => {
    if (!isValid) {
      return;
    }

    const success = await install({
      universalIdentifier: packageName.trim(),
      version: version.trim() || undefined,
    });

    if (success) {
      await refetch();
      closeModal(INSTALL_NPM_APP_MODAL_ID);
      setPackageName('');
      setVersion('');
    }
  };

  const handleCancel = () => {
    closeModal(INSTALL_NPM_APP_MODAL_ID);
    setPackageName('');
    setVersion('');
  };

  return (
    <StyledAppModal
      modalId={INSTALL_NPM_APP_MODAL_ID}
      isClosable={true}
      padding="large"
      modalVariant="primary"
      dataGloballyPreventClickOutside
      ignoreContainer
    >
      <StyledAppModalTitle>
        <H1Title
          title={t`Install from npm`}
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledAppModalTitle>
      <StyledAppModalSection
        alignment={SectionAlignment.Center}
        fontColor={SectionFontColor.Primary}
      >
        {t`Enter the npm package name of the application you want to install.`}
      </StyledAppModalSection>

      <Section>
        <StyledInputGroup>
          <SettingsTextInput
            instanceId="npm-package-name-input"
            value={packageName}
            onChange={setPackageName}
            placeholder={t`e.g. @twentyhq/hello-world`}
            fullWidth
            disableHotkeys
            label={t`Package name`}
            autoFocusOnMount
          />
          <SettingsTextInput
            instanceId="npm-version-input"
            value={version}
            onChange={setVersion}
            placeholder={t`latest`}
            fullWidth
            disableHotkeys
            label={t`Version (optional)`}
          />
        </StyledInputGroup>
      </Section>

      <StyledAppModalButton
        onClick={handleCancel}
        variant="secondary"
        title={t`Cancel`}
        fullWidth
      />
      <StyledAppModalButton
        onClick={handleInstall}
        variant="secondary"
        accent="blue"
        title={t`Install`}
        disabled={!isValid || isInstalling}
        fullWidth
      />
    </StyledAppModal>
  );
};
