import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { Toggle } from '@/ui/input/components/Toggle';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';

type SettingsAccountsToggleSettingCardProps = {
  cardMedia: ReactNode;
  value: boolean;
  onToggle: (value: boolean) => void;
  title: string;
};

const StyledCardContent = styled(CardContent)`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(2, 4)};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-right: auto;
`;

export const SettingsAccountsToggleSettingCard = ({
  cardMedia,
  value,
  onToggle,
  title,
}: SettingsAccountsToggleSettingCardProps) => (
  <Card>
    <StyledCardContent onClick={() => onToggle(!value)}>
      {cardMedia}
      <StyledTitle>{title}</StyledTitle>
      <Toggle value={value} onChange={onToggle} />
    </StyledCardContent>
  </Card>
);
