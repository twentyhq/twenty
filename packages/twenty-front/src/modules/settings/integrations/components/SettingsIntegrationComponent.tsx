import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import {
  IconArrowUpRight,
  IconBolt,
  IconCopy,
  IconPlus,
  Status,
} from 'twenty-ui/display';
import { Pill } from 'twenty-ui/components';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

interface SettingsIntegrationComponentProps {
  integration: SettingsIntegration;
}

const StyledContainer = styled.div<{ to?: string }>`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)};
  text-decoration: none;
  color: ${({ theme }) => theme.font.color.primary};

  ${({ to }) =>
    isDefined(to) &&
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
  const { copyToClipboard } = useCopyToClipboard();
  return (
    <StyledContainer
      to={integration.type === 'Active' ? integration.link : undefined}
      as={integration.type === 'Active' ? Link : 'div'}
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
          to={integration.link}
          Icon={IconPlus}
          title="Add"
          size="small"
        />
      ) : integration.type === 'Use' ? (
        <Button
          to={integration.link}
          target="_blank"
          Icon={IconBolt}
          title="Use"
          size="small"
        />
      ) : integration.type === 'Copy' ? (
        <Button
          onClick={() => {
            if (isDefined(integration.content)) {
              copyToClipboard(integration.content);
            }
          }}
          Icon={IconCopy}
          title={integration.linkText}
          size="small"
        />
      ) : (
        <Button
          to={integration.link}
          target="_blank"
          Icon={IconArrowUpRight}
          title={integration.linkText}
          size="small"
        />
      )}
    </StyledContainer>
  );
};
