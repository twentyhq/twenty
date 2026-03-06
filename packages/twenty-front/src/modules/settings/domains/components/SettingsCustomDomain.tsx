/* @license Enterprise */
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { TextInput } from '@/ui/input/components/TextInput';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { H2Title, IconReload, IconTrash } from 'twenty-ui/display';
import { Button, ButtonGroup } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { SettingsDomainRecords } from '@/settings/domains/components/SettingsDomainRecords';
import { CheckCustomDomainValidRecordsEffect } from '@/settings/domains/components/CheckCustomDomainValidRecordsEffect';
import { useCheckCustomDomainValidRecords } from '@/settings/domains/hooks/useCheckCustomDomainValidRecords';
import { customDomainRecordsState } from '@/settings/domains/states/customDomainRecordsState';

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
  const { customDomainRecords, isLoading } = useAtomStateValue(
    customDomainRecordsState,
  );

  const { checkCustomDomainRecords } = useCheckCustomDomainValidRecords();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { t } = useLingui();

  const { control, setValue, trigger } = useFormContext<{
    customDomain: string;
  }>();

  const deleteCustomDomain = () => {
    setValue('customDomain', '');
    trigger();
  };

  return (
    <Section>
      <H2Title
        title={t`Custom Domain`}
        description={t`Set the name of your custom domain and configure your DNS records.`}
      />
      <CheckCustomDomainValidRecordsEffect />
      <StyledDomainFormWrapper>
        <Controller
          name="customDomain"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextInput
              value={value}
              type="text"
              onChange={onChange}
              placeholder="crm.yourdomain.com"
              error={error?.message}
              fullWidth
            />
          )}
        />
        {currentWorkspace?.customDomain && (
          <StyledButtonGroupContainer>
            <ButtonGroup>
              <StyledButtonContainer>
                <Button
                  isLoading={isLoading}
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
                  onClick={deleteCustomDomain}
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
  );
};
