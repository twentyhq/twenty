import styled from '@emotion/styled';
import ReactIcon from '../icons/ReactIcon';
import { IconType } from 'react-icons/lib';

type OwnProps = {
  viewName: string;
  viewIcon?: IconType;
};

const StyledTitle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: ${(props) => props.theme.spacing(8)};
  font-weight: 500;
  padding-left: ${(props) => props.theme.spacing(2)};
`;

const StyledIcon = styled.div`
  display: flex;
  margin-right: ${(props) => props.theme.spacing(1)};
`;

function TableHeader({ viewName, viewIcon }: OwnProps) {
  return (
    <StyledTitle>
      <StyledIcon>{viewIcon && <ReactIcon icon={viewIcon} />}</StyledIcon>
      {viewName}
    </StyledTitle>
  );
}

export default TableHeader;
