import styled from '@emotion/styled';

import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';
import { SettingsIntegrationComponent } from '~/pages/settings/integrations/SettingsIntegrationComponent';
import { SettingsIntegrationCategory } from '~/pages/settings/integrations/types/SettingsIntegrationCategory';

interface SettingsIntegrationGroupProps {
  integrationGroup: SettingsIntegrationCategory;
}

const StyledIntegrationGroupHeader = styled.div`
  align-items: start;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const StyledGroupLink = styled.div`
  align-items: start;
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(1)};
  cursor: pointer;
`;

const StyledIntegrationsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsIntegrationGroup = ({
  integrationGroup,
}: SettingsIntegrationGroupProps) => {
  const openLinkInTab = (link: string) => {
    window.open(link);
  };
  return (
    <Section>
      <StyledIntegrationGroupHeader>
        <H2Title title={integrationGroup.title} />
        {integrationGroup.hyperlink && (
          <StyledGroupLink
            onClick={() => openLinkInTab(integrationGroup.hyperlink ?? '')}
          >
            <div>{integrationGroup.hyperlinkText}</div>
            <div>→</div>
          </StyledGroupLink>
        )}
      </StyledIntegrationGroupHeader>
      <StyledIntegrationsSection>
        {integrationGroup.integrations.map((integration) => {
          return <SettingsIntegrationComponent integration={integration} />;
        })}
      </StyledIntegrationsSection>
    </Section>
  );
};
