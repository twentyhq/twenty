/* @license Enterprise */
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { H2Title, IconReload, IconTrash } from 'twenty-ui/display';
import { Button, ButtonGroup } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { CheckCustomDomainValidRecordsEffect } from '~/pages/settings/workspace/CheckCustomDomainValidRecordsEffect';
import { SettingsCustomDomainRecords } from '~/pages/settings/workspace/SettingsCustomDomainRecords';
import { useCheckCustomDomainValidRecords } from '~/pages/settings/workspace/hooks/useCheckCustomDomainValidRecords';
import { customDomainRecordsState } from '~/pages/settings/workspace/states/customDomainRecordsState';

const StyledDomainFormWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledButtonGroup = styled(ButtonGroup)`
  & > :not(:first-of-type) > button {
    border-left: none;
  }
`;

const StyledButton = styled(Button)`
  align-self: flex-start;
`;

const StyledRecordsWrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};

  & > :not(:first-of-type) {
    margin-top: ${({ theme }) => theme.spacing(4)};
  }
`;

export const SettingsCustomDomain = () => {
  const { customDomainRecords, isLoading } = useRecoilValue(
    customDomainRecordsState,
  );

  const { checkCustomDomainRecords } = useCheckCustomDomainValidRecords();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

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
          <StyledButtonGroup>
            <StyledButton
              isLoading={isLoading}
              Icon={IconReload}
              title={t`Reload`}
              variant="primary"
              onClick={checkCustomDomainRecords}
              type="button"
            />
            <StyledButton
              Icon={IconTrash}
              variant="primary"
              onClick={deleteCustomDomain}
            />
          </StyledButtonGroup>
        )}
      </StyledDomainFormWrapper>
      {currentWorkspace?.customDomain && (
        <StyledRecordsWrapper>
          {customDomainRecords && (
            <SettingsCustomDomainRecords
              records={customDomainRecords.records}
            />
          )}
        </StyledRecordsWrapper>
      )}
    </Section>
  );
};
