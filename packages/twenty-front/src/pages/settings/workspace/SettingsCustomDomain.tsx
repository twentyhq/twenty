/* @license Enterprise */

import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title, Section } from 'twenty-ui';
import { useCheckCustomDomainValidRecordsQuery } from '~/generated/graphql';
import { SettingsCustomDomainRecords } from '~/pages/settings/workspace/SettingsCustomDomainRecords';
import { SettingsCustomDomainRecordsStatus } from '~/pages/settings/workspace/SettingsCustomDomainRecordsStatus';

const StyledDomainFormWrapper = styled.div`
  align-items: center;
  display: flex;
`;

const StyledRecordsWrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsCustomDomain = () => {
  const { data: checkCustomDomainValidRecordsData } =
    useCheckCustomDomainValidRecordsQuery();

  const { t } = useLingui();

  const { control, getValues } = useFormContext<{
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
              value={value ?? undefined}
              type="text"
              onChange={onChange}
              error={error?.message}
              fullWidth
            />
          )}
        />
      </StyledDomainFormWrapper>
      {checkCustomDomainValidRecordsData?.checkCustomDomainValidRecords &&
        getValues('customDomain') ===
          checkCustomDomainValidRecordsData?.checkCustomDomainValidRecords
            ?.customDomain && (
          <StyledRecordsWrapper>
            <SettingsCustomDomainRecordsStatus
              records={
                checkCustomDomainValidRecordsData.checkCustomDomainValidRecords
                  .records
              }
            />
            <SettingsCustomDomainRecords
              records={
                checkCustomDomainValidRecordsData.checkCustomDomainValidRecords
                  .records
              }
            />
          </StyledRecordsWrapper>
        )}
    </Section>
  );
};
