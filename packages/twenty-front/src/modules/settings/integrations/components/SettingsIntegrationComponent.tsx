import { useNavigate } from 'react-router-dom';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { IconArrowUpRight, IconBolt, IconPlus, Pill } from 'twenty-ui';

import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
import { Status } from '@/ui/display/status/components/Status';
import { Button } from '@/ui/input/button/components/Button';
import { isDefined } from '~/utils/isDefined';

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

  ${({ onClick }) =>
    isDefined(onClick) &&
    css`
      cursor: pointer;
    `}
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

const StyledSoonPill = styled(Pill)`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
`;

const StyledLogo = styled.img`
  height: 24px;
  width: 24px;
`;

export const SettingsIntegrationComponent = ({
  integration,
}: SettingsIntegrationComponentProps) => {
  const navigate = useNavigate();

  const navigateToIntegrationPage = () => navigate(integration.link);
  const openExternalLink = () => window.open(integration.link);

  return (
    <StyledContainer
      onClick={
        integration.type === 'Active' ? navigateToIntegrationPage : undefined
      }
    >
      <StyledSection>
        <StyledIntegrationLogo>
          <StyledLogo src={integration.from.image} alt={integration.from.key} />
          {isDefined(integration.to) && (
            <>
              <div>→</div>
              <StyledLogo src={integration.to.image} alt={integration.to.key} />
            </>
          )}
        </StyledIntegrationLogo>
        {integration.text}
      </StyledSection>
      {integration.type === 'Soon' ? (
        <StyledSoonPill label="Soon" />
      ) : integration.type === 'Active' ? (
        <Status color="green" text="Active" />
      ) : integration.type === 'Add' ? (
        <Button
          onClick={navigateToIntegrationPage}
          Icon={IconPlus}
          title="Add"
          size="small"
        />
      ) : integration.type === 'Use' ? (
        <Button
          onClick={openExternalLink}
          Icon={IconBolt}
          title="Use"
          size="small"
        />
      ) : (
        <Button
          onClick={openExternalLink}
          Icon={IconArrowUpRight}
          title={integration.linkText}
          size="small"
        />
      )}
    </StyledContainer>
  );
};
