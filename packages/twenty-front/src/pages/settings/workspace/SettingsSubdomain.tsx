import { H2Title, Section } from 'twenty-ui';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { Controller, useFormContext } from 'react-hook-form';
import styled from '@emotion/styled';

import { isDefined } from '~/utils/isDefined';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useRecoilValue } from 'recoil';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

const StyledDomainFromWrapper = styled.div`
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
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { control } = useFormContext<Form>();

  return (
    <Section>
      <H2Title title="Subdomain" description="Set the name of your subdomain" />
      {currentWorkspace?.subdomain && (
        <StyledDomainFromWrapper>
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
        </StyledDomainFromWrapper>
      )}
    </Section>
  );
};
