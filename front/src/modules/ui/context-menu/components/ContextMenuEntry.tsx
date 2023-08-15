import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';

type ContextMenuEntryAccent = 'regular' | 'danger';

type OwnProps = {
  icon: ReactNode;
  label: string;
  accent?: ContextMenuEntryAccent;
  onClick: () => void;
};

const StyledButtonLabel = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

export function ContextMenuEntry({
  label,
  icon,
  accent = 'regular',
  onClick,
}: OwnProps) {
  return (
    <DropdownMenuItem onClick={onClick} accent={accent}>
      {icon}
      <StyledButtonLabel>{label}</StyledButtonLabel>
    </DropdownMenuItem>
  );
}
