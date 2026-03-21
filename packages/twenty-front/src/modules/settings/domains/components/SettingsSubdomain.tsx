import { TextInput } from '@/ui/input/components/TextInput';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledDomainFormWrapper = styled.div`
  align-items: center;
  display: flex;
`;

type SettingsSubdomainProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export const SettingsSubdomain = ({
  value,
  onChange,
  error,
}: SettingsSubdomainProps) => {
  const domainConfiguration = useAtomStateValue(domainConfigurationState);
  const { t } = useLingui();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return (
    <Section>
      <H2Title
        title={t`Subdomain`}
        description={t`Set the name of your subdomain`}
      />
      <StyledDomainFormWrapper>
        <TextInput
          value={value}
          type="text"
          onChange={onChange}
          error={error}
          disabled={!!currentWorkspace?.customDomain}
          rightAdornment={
            isDefined(domainConfiguration.frontDomain)
              ? `.${domainConfiguration.frontDomain}`
              : undefined
          }
          fullWidth
        />
      </StyledDomainFormWrapper>
    </Section>
  );
};
