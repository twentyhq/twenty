import { useSignUpInNewWorkspace } from '@/auth/sign-in-up/hooks/useSignUpInNewWorkspace';
import { OnboardingAnimatedReveal } from '@/onboarding/components/OnboardingAnimatedReveal';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { useWorkspaceSubdomainField } from '@/auth/sign-in-up/hooks/useWorkspaceSubdomainField';
import { isCreatingWorkspaceState } from '@/auth/states/isCreatingWorkspaceState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { IconTrash, IconUpload } from 'twenty-ui/icon';
import { Button, LightIconButton, MainButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[14]};
  max-width: 100%;
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

const StyledHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.2;
`;

const StyledSubtitle = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.4;
`;

const StyledFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  padding-bottom: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledLogoRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLogoAvatar = styled(Avatar)`
  height: ${themeCssVariables.spacing[8]};
  width: ${themeCssVariables.spacing[8]};
`;

const StyledLogoButtons = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledHiddenFileInput = styled.input`
  display: none;
`;

const StyledSubdomainSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledAlternativesBox = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledAlternativesLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledAlternativeRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledAlternativeRow = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: ${themeCssVariables.color.green};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
  padding: 2px 0;
  text-align: left;
`;

const StyledAvailabilityDotBox = styled.div`
  display: flex;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledAvailabilityDot = styled.div`
  background-color: ${themeCssVariables.color.green};
  border-radius: 50%;
  box-shadow: 0 0 0 3px ${themeCssVariables.color.green5};
  corner-shape: round;
  flex-shrink: 0;
  height: 6px;
  width: 6px;
`;

export const SignInUpWorkspaceCreationForm = () => {
  const { t } = useLingui();
  const { createWorkspace } = useSignUpInNewWorkspace();
  const { frontDomain } = useAtomStateValue(domainConfigurationState);
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );

  const isCreatingWorkspace = useAtomStateValue(isCreatingWorkspaceState);
  const setIsCreatingWorkspace = useSetAtomState(isCreatingWorkspaceState);
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

  return (
    <StyledContentContainer>
      <StyledHeading>
        <OnboardingStepAnimatedItem index={0}>
          <StyledTitle>{t`Create your workspace`}</StyledTitle>
        </OnboardingStepAnimatedItem>
        <OnboardingStepAnimatedItem index={1}>
          <StyledSubtitle>
            {t`Move work forward across teams and agents`}
          </StyledSubtitle>
        </OnboardingStepAnimatedItem>
      </StyledHeading>
      <StyledFormSection>
        <OnboardingStepAnimatedItem index={2}>
          <StyledLogoRow>
            <StyledLogoAvatar
              avatarUrl={logoPreviewUrl}
              placeholder={
                isNonEmptyString(workspaceName) ? workspaceName : '?'
              }
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
            <StyledLogoButtons>
              <Button
                Icon={IconUpload}
                title={t`Upload logo`}
                variant="secondary"
                onClick={openFilePicker}
              />
              <LightIconButton
                Icon={IconTrash}
                accent="tertiary"
                size="medium"
                onClick={handleLogoRemove}
                disabled={!isDefined(logoPreviewUrl)}
                aria-label={t`Remove logo`}
              />
            </StyledLogoButtons>
          </StyledLogoRow>
        </OnboardingStepAnimatedItem>
        <OnboardingStepAnimatedItem index={3}>
          <TextInput
            autoFocus
            label={t`Name`}
            value={workspaceName}
            placeholder={t`Apple`}
            onChange={handleWorkspaceNameChange}
            onKeyDown={handleKeyDown}
            fullWidth
          />
        </OnboardingStepAnimatedItem>
        {isMultiWorkspaceEnabled && (
          <OnboardingStepAnimatedItem index={4}>
            <StyledSubdomainSection>
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
              <OnboardingAnimatedReveal isVisible={status === 'unavailable'}>
                <StyledAlternativesBox>
                  <StyledAlternativesLabel>
                    {t`Subdomain already in use, here are some alternatives:`}
                  </StyledAlternativesLabel>
                  <StyledAlternativeRows>
                    {suggestions.map((alternative) => (
                      <StyledAlternativeRow
                        key={alternative}
                        type="button"
                        onClick={() => applySuggestionValue(alternative)}
                      >
                        <StyledAvailabilityDotBox>
                          <StyledAvailabilityDot />
                        </StyledAvailabilityDotBox>
                        {alternative}
                      </StyledAlternativeRow>
                    ))}
                  </StyledAlternativeRows>
                </StyledAlternativesBox>
              </OnboardingAnimatedReveal>
            </StyledSubdomainSection>
          </OnboardingStepAnimatedItem>
        )}
      </StyledFormSection>
      <OnboardingStepAnimatedItem index={isMultiWorkspaceEnabled ? 5 : 4}>
        <MainButton
          title={t`Create workspace`}
          onClick={handleSubmit}
          disabled={isContinueDisabled}
          fullWidth
        />
      </OnboardingStepAnimatedItem>
    </StyledContentContainer>
  );
};
