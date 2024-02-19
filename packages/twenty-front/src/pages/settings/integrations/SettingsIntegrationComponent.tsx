import styled from '@emotion/styled';

import { IconArrowUpRight, IconBolt } from '@/ui/display/icon';
import { SoonPill } from '@/ui/display/pill/components/SoonPill';
import { Button } from '@/ui/input/button/components/Button';
import { SettingsIntegration } from '~/pages/settings/integrations/types/SettingsIntegration';

interface SettingsIntegrationComponentProps {
  integration: SettingsIntegration;
}

const StyledContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledSection = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledIntegrationLogo = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.border.color.strong};
`;

const StyledSoonPill = styled(SoonPill)`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
`;

const StyledLogo = styled.img`
  height: 24px;
  width: 24px;
`;

export const SettingsIntegrationComponent = ({
  integration,
}: SettingsIntegrationComponentProps) => {
  const openLinkInTab = (link: string) => {
    window.open(link);
  };

  return (
    <StyledContainer>
      <StyledSection>
        <StyledIntegrationLogo>
          <StyledLogo src={integration.from.image} alt={integration.from.key} />
          {integration.to ? (
            <>
              <div>→</div>
              <StyledLogo src={integration.to.image} alt={integration.to.key} />
            </>
          ) : (
            <></>
          )}
        </StyledIntegrationLogo>
        {integration.text}
      </StyledSection>
      {integration.type === 'Soon' ? (
        <StyledSoonPill />
      ) : (
        <Button
          onClick={() => openLinkInTab(integration.link)}
          Icon={integration.type === 'Goto' ? IconArrowUpRight : IconBolt}
          title={integration.type === 'Goto' ? integration.linkText : 'Use'}
          size="small"
        />
      )}
    </StyledContainer>
  );
};
