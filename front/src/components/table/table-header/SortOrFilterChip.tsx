import styled from '@emotion/styled';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type OwnProps = {
  id: string;
  label: string;
  icon: IconProp;
  onRemove: () => void;
};

const StyledChip = styled.div`
  border-radius: 50px;
  display: flex;
  flex-direction: row;
  background-color: ${(props) => props.theme.blueHighTransparency};
  border: 1px solid ${(props) => props.theme.blueLowTransparency};
  color: ${(props) => props.theme.blue};
  padding: ${(props) => props.theme.spacing(1)}
    ${(props) => props.theme.spacing(2)};
  margin-left: ${(props) => props.theme.spacing(2)};
  fontsize: ${(props) => props.theme.fontSizeSmall};
`;
const StyledIcon = styled.div`
  margin-right: ${(props) => props.theme.spacing(1)};
`;

const StyledDelete = styled.div`
  margin-left: ${(props) => props.theme.spacing(2)};
  cursor: pointer;
`;

function SortOrFilterChip({ id, label, icon, onRemove }: OwnProps) {
  return (
    <StyledChip>
      <StyledIcon>
        <FontAwesomeIcon icon={icon} />
      </StyledIcon>
      {label}
      <StyledDelete onClick={onRemove} data-testid={'remove-icon-' + id}>
        <FontAwesomeIcon icon={faTimes} />
      </StyledDelete>
    </StyledChip>
  );
}

export default SortOrFilterChip;
