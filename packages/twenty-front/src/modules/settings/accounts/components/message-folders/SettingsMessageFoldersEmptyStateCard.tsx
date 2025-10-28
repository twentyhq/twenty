import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconFolder } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

export const SettingsMessageFoldersEmptyStateCard = () => {
  const theme = useTheme();

  return (
    <Section>
      <StyledEmptyState>
        <IconFolder size={theme.icon.size.md} />
        <div>{t`No folders found for this account`}</div>
      </StyledEmptyState>
    </Section>
  );
};
