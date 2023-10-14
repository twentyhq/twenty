import styled from '@emotion/styled';

import { IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';

const StyledTaskGroupEmptyContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 100%;
  justify-content: center;
  padding-bottom: ${({ theme }) => theme.spacing(16)};
  padding-left: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(4)};
  padding-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledEmptyTaskGroupTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
`;

const StyledEmptyTaskGroupSubTitle = styled.div`
  color: ${({ theme }) => theme.font.color.extraLight};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

type EmptyTableProps = {
  title: string;
  onClick: () => void;
};

export const EmptyTable = ({ title, onClick }: EmptyTableProps) => {
  return (
    <StyledTaskGroupEmptyContainer>
      <StyledEmptyTaskGroupTitle>No {title} yet</StyledEmptyTaskGroupTitle>
      <StyledEmptyTaskGroupSubTitle>Create one:</StyledEmptyTaskGroupSubTitle>
      <Button
        Icon={IconPlus}
        title={`Add a ${title}`}
        accent="blue"
        size="medium"
        onClick={onClick}
      />
    </StyledTaskGroupEmptyContainer>
  );
};
