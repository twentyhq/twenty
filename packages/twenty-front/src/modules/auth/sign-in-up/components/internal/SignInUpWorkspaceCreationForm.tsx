import { SubTitle } from '@/auth/components/SubTitle';
import { StyledOnboardingContentContainer } from '@/auth/components/StyledOnboardingContentContainer';
import { useSignUpInNewWorkspace } from '@/auth/sign-in-up/hooks/useSignUpInNewWorkspace';
import { useWorkspaceSubdomainField } from '@/auth/sign-in-up/hooks/useWorkspaceSubdomainField';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { InputHint } from '@/ui/input/components/InputHint';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { ClickToActionLink } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSection = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[6]};
  width: 100%;
`;

const StyledAvailableHint = styled.div`
  color: ${themeCssVariables.color.green};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.regular};
  margin-top: ${themeCssVariables.spacing[0.5]};
`;

const StyledUnavailableHint = styled.div`
  color: ${themeCssVariables.color.red};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
  margin-top: ${themeCssVariables.spacing[0.5]};
`;

export const SignInUpWorkspaceCreationForm = () => {
  const { t } = useLingui();
  const { createWorkspace } = useSignUpInNewWorkspace();
  const { frontDomain } = useAtomStateValue(domainConfigurationState);
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logo, setLogo] = useState<File | undefined>(undefined);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | undefined>(
    undefined,
  );

  const {
    workspaceName,
    subdomain,
    status,
    errorMessage,
    suggestion,
    isAvailable,
    handleWorkspaceNameChange,
    handleSubdomainChange,
    applySuggestion,
  } = useWorkspaceSubdomainField({
    isSubdomainEnabled: isMultiWorkspaceEnabled,
  });

  // Single-workspace self-host has a fixed address, so we only collect the name
  // and let the backend keep its default subdomain.
  const isContinueDisabled = isMultiWorkspaceEnabled
    ? workspaceName.trim() === '' || !isAvailable || isSubmitting
    : workspaceName.trim() === '' || isSubmitting;

  // The workspace does not exist yet, so we hold the picked file locally and
  // only upload it once the workspace is created.
  const handleLogoUpload = (file: File) => {
    if (!isDefined(file)) {
      return;
    }
    setLogo(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const handleLogoRemove = () => {
    setLogo(undefined);
    setLogoPreviewUrl(undefined);
  };

  // Revoke the active object URL whenever it is replaced and on unmount, so the
  // picked logo preview never leaks (including if the user navigates away).
  useEffect(() => {
    if (!isDefined(logoPreviewUrl)) {
      return;
    }

    return () => {
      URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  const handleSubmit = async () => {
    if (isContinueDisabled) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createWorkspace({
        displayName: workspaceName.trim(),
        // Single-workspace self-host keeps the backend default subdomain.
        ...(isMultiWorkspaceEnabled ? { subdomain } : {}),
        logo,
        newTab: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) {
      return;
    }
    if (event.key === Key.Enter) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const subdomainError =
    status === 'invalid'
      ? errorMessage
      : status === 'unavailable'
        ? t`This address is already taken`
        : status === 'error'
          ? t`Couldn't check availability. Please try again.`
          : undefined;

  return (
    <StyledOnboardingContentContainer>
      <SubTitle>
        {isMultiWorkspaceEnabled
          ? t`Pick a name and a web address for your new workspace.`
          : t`Pick a name and a logo for your new workspace.`}
      </SubTitle>
      <StyledSection>
        <InputLabel>{t`Workspace logo`}</InputLabel>
        <ImageInput
          picture={logoPreviewUrl}
          onUpload={handleLogoUpload}
          onRemove={handleLogoRemove}
        />
      </StyledSection>
      <StyledSection>
        <TextInput
          autoFocus
          label={t`Workspace name`}
          value={workspaceName}
          placeholder={t`Apple`}
          onChange={handleWorkspaceNameChange}
          onKeyDown={handleKeyDown}
          fullWidth
        />
      </StyledSection>
      {isMultiWorkspaceEnabled && (
        <StyledSection>
          <TextInput
            label={t`Workspace address`}
            value={subdomain}
            placeholder={t`apple`}
            onChange={handleSubdomainChange}
            onKeyDown={handleKeyDown}
            rightAdornment={
              isNonEmptyString(frontDomain) ? `.${frontDomain}` : undefined
            }
            error={subdomainError}
            noErrorHelper={
              status === 'unavailable' || !isDefined(subdomainError)
            }
            fullWidth
          />
          {status === 'checking' && <InputHint>{t`Checking…`}</InputHint>}
          {status === 'available' && (
            <StyledAvailableHint>
              {t`This address is available`}
            </StyledAvailableHint>
          )}
          {status === 'unavailable' && (
            <StyledUnavailableHint>
              {subdomainError}
              {isDefined(suggestion) && (
                <ClickToActionLink onClick={applySuggestion}>
                  {t`Use ${suggestion} instead`}
                </ClickToActionLink>
              )}
            </StyledUnavailableHint>
          )}
        </StyledSection>
      )}
      <StyledButtonContainer>
        <MainButton
          title={t`Continue`}
          onClick={handleSubmit}
          disabled={isContinueDisabled}
          Icon={() => (isSubmitting ? <Loader /> : null)}
          fullWidth
        />
      </StyledButtonContainer>
    </StyledOnboardingContentContainer>
  );
};
