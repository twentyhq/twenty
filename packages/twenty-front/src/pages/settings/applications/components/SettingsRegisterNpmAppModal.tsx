import { styled } from '@linaria/react';
import { useState } from 'react';

import { FIND_MANY_APPLICATION_REGISTRATIONS } from '@/settings/application-registrations/graphql/queries/findManyApplicationRegistrations';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useApolloClient } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useRegisterNpmPackage } from '~/modules/marketplace/hooks/useRegisterNpmPackage';
import {
  StyledAppModal,
  StyledAppModalButton,
  StyledAppModalSection,
  StyledAppModalTitle,
} from '~/pages/settings/applications/components/SettingsAppModalLayout';

export const REGISTER_NPM_APP_MODAL_ID = 'register-npm-app-modal';

const StyledInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

export const SettingsRegisterNpmAppModal = () => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const { register, isRegistering } = useRegisterNpmPackage();
  const apolloClient = useApolloClient();

  const [packageName, setPackageName] = useState('');

  const isValid = packageName.trim().length > 0;

  const handleRegister = async () => {
    if (!isValid) {
      return;
    }

    const success = await register({
      packageName: packageName.trim(),
    });

    if (success) {
      await apolloClient.refetchQueries({
        include: [FIND_MANY_APPLICATION_REGISTRATIONS],
      });
      closeModal(REGISTER_NPM_APP_MODAL_ID);
      setPackageName('');
    }
  };

  const handleCancel = () => {
    closeModal(REGISTER_NPM_APP_MODAL_ID);
    setPackageName('');
  };

  return (
    <StyledAppModal
      modalId={REGISTER_NPM_APP_MODAL_ID}
      isClosable={true}
      padding="large"
      dataGloballyPreventClickOutside
    >
      <StyledAppModalTitle>
        <H1Title
          title={t`Register from npm`}
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledAppModalTitle>
      <StyledAppModalSection
        alignment={SectionAlignment.Center}
        fontColor={SectionFontColor.Primary}
      >
        {t`Enter the npm package name to register as an application.`}
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
        </StyledInputGroup>
      </Section>

      <StyledAppModalButton
        onClick={handleCancel}
        variant="secondary"
        title={t`Cancel`}
        fullWidth
      />
      <StyledAppModalButton
        onClick={handleRegister}
        variant="secondary"
        accent="blue"
        title={t`Register`}
        disabled={!isValid || isRegistering}
        fullWidth
      />
    </StyledAppModal>
  );
};
