import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';

import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useRecoilValue } from 'recoil';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

const StyledDomainFormWrapper = styled.div`
  align-items: center;
  display: flex;
`;

export const SettingsSubdomain = () => {
  const domainConfiguration = useRecoilValue(domainConfigurationState);
  const { t } = useLingui();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { control } = useFormContext<{
    subdomain: string;
  }>();

  return (
    <Section>
      <H2Title
        title={t`Subdomain`}
        description={t`Set the name of your subdomain`}
      />
      <StyledDomainFormWrapper>
        <Controller
          name="subdomain"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <TextInputV2
                value={value}
                type="text"
                onChange={onChange}
                error={error?.message}
                disabled={!!currentWorkspace?.customDomain}
                rightAdornment={
                  isDefined(domainConfiguration.frontDomain)
                    ? `.${domainConfiguration.frontDomain}`
                    : undefined
                }
                fullWidth
              />
            </>
          )}
        />
      </StyledDomainFormWrapper>
    </Section>
  );
};
