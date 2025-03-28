/* @license Enterprise */
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { SettingsCustomDomainRecords } from '~/pages/settings/workspace/SettingsCustomDomainRecords';
import { SettingsCustomDomainRecordsStatus } from '~/pages/settings/workspace/SettingsCustomDomainRecordsStatus';
import { useCheckCustomDomainValidRecords } from '~/pages/settings/workspace/hooks/useCheckCustomDomainValidRecords';
import { customDomainRecordsState } from '~/pages/settings/workspace/states/customDomainRecordsState';
import { H2Title, IconReload } from 'twenty-ui/display';

const StyledDomainFormWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
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

  if (!customDomainRecords && !isLoading) {
    checkCustomDomainRecords();
  }

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { t } = useLingui();

  const { control } = useFormContext<{
    customDomain: string;
  }>();

  return (
    <Section>
      <H2Title
        title={t`Custom Domain`}
        description={t`Set the name of your custom domain and configure your DNS records.`}
      />
      <StyledDomainFormWrapper>
        <Controller
          name="customDomain"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextInputV2
              value={value}
              type="text"
              onChange={onChange}
              placeholder="crm.yourdomain.com"
              error={error?.message}
              fullWidth
            />
          )}
        />
        <StyledButton
          isLoading={isLoading}
          Icon={IconReload}
          title={t`Reload`}
          variant="primary"
          onClick={checkCustomDomainRecords}
          type="button"
        />
      </StyledDomainFormWrapper>
      {currentWorkspace?.customDomain && (
        <StyledRecordsWrapper>
          <SettingsCustomDomainRecordsStatus />
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
