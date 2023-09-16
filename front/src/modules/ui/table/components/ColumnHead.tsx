import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { IconComponent } from '@/ui/icon/types/IconComponent';

import { selectedTableColumnHeaderState } from '../states/selectedTableColumnHeaderState';

type OwnProps = {
  viewName: string;
  ViewIcon?: IconComponent;
  headerOptionsComponent?: JSX.Element;
};

const StyledTitle = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledIcon = styled.div`
  display: flex;

  & > svg {
    height: ${({ theme }) => theme.icon.size.md}px;
    width: ${({ theme }) => theme.icon.size.md}px;
  }
`;

const StyledText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ColumnHead = ({
  viewName,
  ViewIcon,
  headerOptionsComponent,
}: OwnProps) => {
  const theme = useTheme();
  const [selectedTableColumnHeader, setSelectedTableColumnHeader] =
    useRecoilState(selectedTableColumnHeaderState);

  const handleOptionsVisibility = () => {
    setSelectedTableColumnHeader(viewName);
  };

  return (
    <>
      <StyledTitle onClick={handleOptionsVisibility}>
        <StyledIcon>
          {ViewIcon && <ViewIcon size={theme.icon.size.md} />}
        </StyledIcon>
        <StyledText>{viewName}</StyledText>
      </StyledTitle>
      {viewName === selectedTableColumnHeader && headerOptionsComponent}
    </>
  );
};
