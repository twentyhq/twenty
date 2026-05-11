/* @license Enterprise */
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { CheckCustomDomainValidRecordsEffect } from '@/settings/domains/components/CheckCustomDomainValidRecordsEffect';
import { SettingsDomainRecords } from '@/settings/domains/components/SettingsDomainRecords';
import { useSettingsCustomDomain } from '@/settings/domains/hooks/useSettingsCustomDomain';
import { customDomainRecordsState } from '@/settings/domains/states/customDomainRecordsState';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Trans, useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconReload, IconTrash } from 'twenty-ui/display';
import { Button, ButtonGroup } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { useCheckCustomDomainValidRecords } from '@/settings/domains/hooks/useCheckCustomDomainValidRecords';

const StyledDomainFormWrapper = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledButtonGroupContainer = styled.div`
  > * > :not(:first-of-type) > button {
    border-left: none;
  }
`;

const StyledButtonContainer = styled.div`
  align-self: flex-start;
`;

const StyledRecordsWrapper = styled.div`
  margin-top: ${themeCssVariables.spacing[2]};

  & > :not(:first-of-type) {
    margin-top: ${themeCssVariables.spacing[4]};
  }
`;

export const SettingsCustomDomain = () => {
  const navigate = useNavigateSettings();
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { customDomainRecords, isLoading: isRecordsLoading } =
    useAtomStateValue(customDomainRecordsState);
  const { checkCustomDomainRecords } = useCheckCustomDomainValidRecords();

  const {
    customDomain,
    error,
    isSubmitting,
    isSaveDisabled,
    handleChange,
    handleDelete,
    handleSave,
  } = useSettingsCustomDomain();

  return (
    <SubMenuTopBarContainer
      title={t`Custom Domain`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>General</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Custom Domain</Trans> },
      ]}
      actionButton={
        <SaveAndCancelButtons
          onCancel={() => navigate(SettingsPath.Workspace)}
          isSaveDisabled={isSaveDisabled}
          isLoading={isSubmitting}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Custom Domain`}
            description={t`Set the name of your custom domain and configure your DNS records.`}
          />
          <CheckCustomDomainValidRecordsEffect />
          <StyledDomainFormWrapper>
            <TextInput
              value={customDomain}
              type="text"
              onChange={handleChange}
              placeholder="crm.yourdomain.com"
              error={error}
              fullWidth
            />
            {currentWorkspace?.customDomain && (
              <StyledButtonGroupContainer>
                <ButtonGroup>
                  <StyledButtonContainer>
                    <Button
                      isLoading={isRecordsLoading}
                      Icon={IconReload}
                      title={t`Reload`}
                      variant="primary"
                      onClick={checkCustomDomainRecords}
                      type="button"
                    />
                  </StyledButtonContainer>
                  <StyledButtonContainer>
                    <Button
                      Icon={IconTrash}
                      variant="primary"
                      onClick={handleDelete}
                    />
                  </StyledButtonContainer>
                </ButtonGroup>
              </StyledButtonGroupContainer>
            )}
          </StyledDomainFormWrapper>
          {currentWorkspace?.customDomain && (
            <StyledRecordsWrapper>
              {customDomainRecords && (
                <SettingsDomainRecords records={customDomainRecords.records} />
              )}
            </StyledRecordsWrapper>
          )}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
