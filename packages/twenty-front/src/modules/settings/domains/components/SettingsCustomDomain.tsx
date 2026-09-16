/* @license Enterprise */
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { CheckCustomDomainValidRecordsEffect } from '@/settings/domains/components/CheckCustomDomainValidRecordsEffect';
import { SettingsDomainRecords } from '@/settings/domains/components/SettingsDomainRecords';
import { useSettingsCustomDomain } from '@/settings/domains/hooks/useSettingsCustomDomain';
import { customDomainRecordsState } from '@/settings/domains/states/customDomainRecordsState';
import { TextInput } from '@/ui/input/components/TextInput';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Trans, useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconReload, IconTrash } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/primitives/typography';
import { Button } from 'twenty-ui/primitives/input';
import { Section } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { useCheckCustomDomainValidRecords } from '@/settings/domains/hooks/useCheckCustomDomainValidRecords';

const StyledDomainFormWrapper = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledButtonsContainer = styled.div`
  align-self: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
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
    <SettingsPageLayout
      title={t`Custom Domain`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: <Trans>General</Trans>,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: <Trans>Custom Domain</Trans> },
      ]}
      actionButton={
        <SaveAndCancelButtons
          onCancel={() => navigate(SettingsPath.General)}
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
              <StyledButtonsContainer>
                <Button
                  loading={isRecordsLoading}
                  startIcon={<IconReload />}
                  onClick={() => checkCustomDomainRecords()}
                  type="button"
                  variant="outline"
                >{t`Reload`}</Button>
                <Button
                  startIcon={<IconTrash />}
                  aria-label={t`Delete`}
                  onClick={handleDelete}
                  variant="outline"
                />
              </StyledButtonsContainer>
            )}
          </StyledDomainFormWrapper>
        </Section>
        {currentWorkspace?.customDomain && customDomainRecords && (
          <SettingsDomainRecords records={customDomainRecords.records} />
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
