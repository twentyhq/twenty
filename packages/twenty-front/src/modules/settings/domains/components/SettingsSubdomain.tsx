import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID,
  useSettingsSubdomain,
} from '@/settings/domains/hooks/useSettingsSubdomain';
import { TextInput } from '@/ui/input/components/TextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Trans, useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledDomainFormWrapper = styled.div`
  align-items: center;
  display: flex;
`;

export const SettingsSubdomain = () => {
  const navigate = useNavigateSettings();
  const { t } = useLingui();
  const domainConfiguration = useAtomStateValue(domainConfigurationState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const {
    subdomain,
    error,
    isSubmitting,
    isSaveDisabled,
    handleChange,
    handleSave,
    handleConfirm,
  } = useSettingsSubdomain();

  return (
    <>
      <SubMenuTopBarContainer
        title={t`Subdomain`}
        links={[
          {
            children: <Trans>Workspace</Trans>,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: <Trans>Domains</Trans>,
            href: getSettingsPath(SettingsPath.Domains),
          },
          { children: <Trans>Subdomain</Trans> },
        ]}
        actionButton={
          <SaveAndCancelButtons
            onCancel={() => navigate(SettingsPath.Domains)}
            isSaveDisabled={isSaveDisabled}
            isLoading={isSubmitting}
            onSave={handleSave}
          />
        }
      >
        <SettingsPageContainer>
          <Section>
            <H2Title
              title={t`Subdomain`}
              description={t`Set the name of your subdomain`}
            />
            <StyledDomainFormWrapper>
              <TextInput
                value={subdomain}
                type="text"
                onChange={handleChange}
                error={error}
                disabled={!!currentWorkspace?.customDomain}
                rightAdornment={
                  isDefined(domainConfiguration.frontDomain)
                    ? `.${domainConfiguration.frontDomain}`
                    : undefined
                }
                fullWidth
              />
            </StyledDomainFormWrapper>
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
      <ConfirmationModal
        modalInstanceId={SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID}
        title={t`Change subdomain?`}
        subtitle={t`You're about to change your workspace subdomain. This action will log out all users.`}
        onConfirmClick={handleConfirm}
      />
    </>
  );
};
