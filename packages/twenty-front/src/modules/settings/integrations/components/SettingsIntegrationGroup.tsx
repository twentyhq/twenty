import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { H2Title, Section } from 'twenty-ui';

import { SettingsIntegrationComponent } from '@/settings/integrations/components/SettingsIntegrationComponent';
import { SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';

interface SettingsIntegrationGroupProps {
  integrationGroup: SettingsIntegrationCategory;
}

const StyledIntegrationGroupHeader = styled.div`
  align-items: start;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const StyledGroupLink = styled(Link)`
  align-items: start;
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(1)};
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledIntegrationsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsIntegrationGroup = ({
  integrationGroup,
}: SettingsIntegrationGroupProps) => (
  <Section>
    <StyledIntegrationGroupHeader>
      <H2Title title={integrationGroup.title} />
      {integrationGroup.hyperlink && (
        <StyledGroupLink
          target={'_blank'}
          to={integrationGroup.hyperlink ?? ''}
        >
          <div>{integrationGroup.hyperlinkText}</div>
          <div>→</div>
        </StyledGroupLink>
      )}
    </StyledIntegrationGroupHeader>
    <StyledIntegrationsSection>
      {integrationGroup.integrations.map((integration) => (
        <SettingsIntegrationComponent
          key={[
            integrationGroup.key,
            integration.from.key,
            integration.to?.key,
          ].join('-')}
          integration={integration}
        />
      ))}
    </StyledIntegrationsSection>
  </Section>
);
