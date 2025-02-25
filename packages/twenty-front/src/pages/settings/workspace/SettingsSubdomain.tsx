import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title, Section } from 'twenty-ui';

import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

const StyledDomainFormWrapper = styled.div`
  align-items: center;
  display: flex;
`;

const StyledDomain = styled.h2`
  align-self: flex-start;
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin: ${({ theme }) => theme.spacing(2)};
  white-space: nowrap;
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
                fullWidth
              />
              {isDefined(domainConfiguration.frontDomain) && (
                <StyledDomain>
                  {`.${domainConfiguration.frontDomain}`}
                </StyledDomain>
              )}
            </>
          )}
        />
      </StyledDomainFormWrapper>
    </Section>
  );
};
