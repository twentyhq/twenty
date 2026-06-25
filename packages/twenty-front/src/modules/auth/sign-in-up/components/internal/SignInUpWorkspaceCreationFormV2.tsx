import { StyledOnboardingContentContainer } from '@/auth/components/StyledOnboardingContentContainer';
import { SignInUpWorkspaceActivationV2 } from '@/auth/sign-in-up/components/SignInUpWorkspaceActivationV2';
import { SignInUpWorkspaceActivationV2Effect } from '@/auth/sign-in-up/components/internal/SignInUpWorkspaceActivationV2Effect';
import { useSignUpInNewWorkspace } from '@/auth/sign-in-up/hooks/useSignUpInNewWorkspace';
import { useWorkspaceSubdomainField } from '@/auth/sign-in-up/hooks/useWorkspaceSubdomainField';
import { isCreatingWorkspaceState } from '@/auth/states/isCreatingWorkspaceState';
import { isOnboardingV2State } from '@/auth/states/isOnboardingV2State';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { IconTrash, IconUpload } from 'twenty-ui/icon';
import { Button, LightIconButton, MainButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeading = styled.div`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledSubtitle = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledSection = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledLogoRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHiddenFileInput = styled.input`
  display: none;
`;

const StyledButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[6]};
  width: 100%;
`;

const StyledAlternativesBox = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledAlternativesLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledAlternativeRow = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: ${themeCssVariables.color.green};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  padding: 0;
  text-align: left;
`;

const StyledAvailabilityDot = styled.div`
  background-color: ${themeCssVariables.color.green};
  border-radius: 50%;
  flex-shrink: 0;
  height: 6px;
  width: 6px;
`;

export const SignInUpWorkspaceCreationFormV2 = () => {
  const { t } = useLingui();
  const { createWorkspace } = useSignUpInNewWorkspace();
  const { frontDomain } = useAtomStateValue(domainConfigurationState);
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );

  const isCreatingWorkspace = useAtomStateValue(isCreatingWorkspaceState);
  const setIsCreatingWorkspace = useSetAtomState(isCreatingWorkspaceState);
  const setIsOnboardingV2 = useSetAtomState(isOnboardingV2State);
  const [logo, setLogo] = useState<File | undefined>(undefined);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | undefined>(
    undefined,
  );
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  const {
    workspaceName,
    subdomain,
    status,
    errorMessage,
    suggestions,
    isAvailable,
    handleWorkspaceNameChange,
    handleSubdomainChange,
    applySuggestionValue,
  } = useWorkspaceSubdomainField({
    isSubdomainEnabled: isMultiWorkspaceEnabled,
  });

  const isContinueDisabled =
    workspaceName.trim() === '' ||
    isCreatingWorkspace ||
    (isMultiWorkspaceEnabled && !isAvailable);

  const openFilePicker = () => {
    hiddenFileInputRef.current?.click();
  };

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

    setIsCreatingWorkspace(true);
    setIsOnboardingV2(true);

    const isWorkspaceCreated = await createWorkspace({
      displayName: workspaceName.trim(),
      ...(isMultiWorkspaceEnabled ? { subdomain } : {}),
      logo,
    });

    if (!isWorkspaceCreated) {
      setIsCreatingWorkspace(false);
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

  if (isCreatingWorkspace) {
    return (
      <>
        <SignInUpWorkspaceActivationV2Effect />
        <SignInUpWorkspaceActivationV2 />
      </>
    );
  }

  return (
    <StyledOnboardingContentContainer>
      <StyledHeading>
        <StyledTitle>{t`Create your workspace`}</StyledTitle>
        <StyledSubtitle>
          {t`Move work forward across teams and agents`}
        </StyledSubtitle>
      </StyledHeading>
      <StyledSection>
        <StyledLogoRow>
          <Avatar
            avatarUrl={logoPreviewUrl}
            placeholder={isNonEmptyString(workspaceName) ? workspaceName : '?'}
            placeholderColorSeed={workspaceName}
            type="squared"
            size="xl"
            onClick={openFilePicker}
          />
          <StyledHiddenFileInput
            type="file"
            ref={hiddenFileInputRef}
            accept="image/jpeg, image/png, image/gif"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (isDefined(file)) {
                handleLogoUpload(file);
              }
              event.target.value = '';
            }}
          />
          <Button
            Icon={IconUpload}
            title={t`Upload logo`}
            variant="secondary"
            onClick={openFilePicker}
          />
          <LightIconButton
            Icon={IconTrash}
            accent="tertiary"
            onClick={handleLogoRemove}
            disabled={!isDefined(logoPreviewUrl)}
            aria-label={t`Remove logo`}
          />
        </StyledLogoRow>
      </StyledSection>
      <StyledSection>
        <TextInput
          autoFocus
          label={t`Name`}
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
            label={t`Subdomain`}
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
          {status === 'unavailable' && (
            <StyledAlternativesBox>
              <StyledAlternativesLabel>
                {t`Subdomain already in use, here are some alternatives:`}
              </StyledAlternativesLabel>
              {suggestions.map((alternative) => (
                <StyledAlternativeRow
                  key={alternative}
                  type="button"
                  onClick={() => applySuggestionValue(alternative)}
                >
                  <StyledAvailabilityDot />
                  {alternative}
                </StyledAlternativeRow>
              ))}
            </StyledAlternativesBox>
          )}
        </StyledSection>
      )}
      <StyledButtonContainer>
        <MainButton
          title={t`Create workspace`}
          onClick={handleSubmit}
          disabled={isContinueDisabled}
          fullWidth
        />
      </StyledButtonContainer>
    </StyledOnboardingContentContainer>
  );
};
