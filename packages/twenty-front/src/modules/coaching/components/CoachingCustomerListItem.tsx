import styled from '@emotion/styled';

type CoachingCustomerListItemProps = {
  name: string;
  email: string | null;
  isSelected: boolean;
  onClick: () => void;
};

const StyledListItem = styled.div<{ isSelected: boolean }>`
  align-items: center;
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.background.tertiary : 'transparent'};
  border-left: 3px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.color.blue : 'transparent'};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => `${theme.spacing(3)} ${theme.spacing(4)}`};
  transition: background 0.1s ease;

  &:hover {
    background: ${({ theme, isSelected }) =>
      isSelected
        ? theme.background.tertiary
        : theme.background.transparent.light};
  }
`;

const StyledAvatar = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.color.blue};
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const getInitials = (name: string): string => {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const CoachingCustomerListItem = ({
  name,
  isSelected,
  onClick,
}: CoachingCustomerListItemProps) => {
  return (
    <StyledListItem isSelected={isSelected} onClick={onClick}>
      <StyledAvatar>{getInitials(name || '?')}</StyledAvatar>
      <StyledName>{name || 'Unnamed'}</StyledName>
    </StyledListItem>
  );
};
