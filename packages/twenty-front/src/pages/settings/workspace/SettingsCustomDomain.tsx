import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title, Section } from 'twenty-ui';
import { useGetCustomDomainDetailsQuery } from '~/generated/graphql';
import { SettingsCustomDomainRecords } from '~/pages/settings/workspace/SettingsCustomDomainRecords';

const StyledDomainFormWrapper = styled.div`
  align-items: center;
  display: flex;
`;

export const SettingsCustomDomain = () => {
  const { data: getCustomDomainDetailsData } = useGetCustomDomainDetailsQuery();

  const { t } = useLingui();

  const { control, getValues } = useFormContext<{
    customDomain: string;
  }>();

  return (
    <Section>
      <H2Title title={t`Domain`} description={t`Set the name of your domain`} />
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
      {getCustomDomainDetailsData?.getCustomDomainDetails &&
        getValues('customDomain') ===
          getCustomDomainDetailsData?.getCustomDomainDetails?.customDomain && (
          <SettingsCustomDomainRecords
            records={getCustomDomainDetailsData.getCustomDomainDetails.records}
          />
        )}
    </Section>
  );
};
