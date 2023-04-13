import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

type OwnProps = {
  viewName: string;
  viewIcon?: IconProp;
};

const StyledTitle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  color: ${(props) => props.theme.text60};
  font-weight: 500;
`;

function TableHeader({ viewName, viewIcon }: OwnProps) {
  return (
    <StyledTitle>
      {viewIcon && <FontAwesomeIcon icon={viewIcon} />}
      {viewName}
    </StyledTitle>
  );
}

export default TableHeader;
