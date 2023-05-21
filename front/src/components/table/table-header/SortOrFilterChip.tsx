import styled from '@emotion/styled';
import { TbX } from 'react-icons/tb';
import { ReactNode } from 'react';

type OwnProps = {
  id: string;
  labelKey?: string;
  labelValue: string;
  icon: ReactNode;
  onRemove: () => void;
};

const StyledChip = styled.div`
  border-radius: 50px;
  display: flex;
  flex-direction: row;
  background-color: ${(props) => props.theme.blueHighTransparency};
  border: 1px solid ${(props) => props.theme.blueLowTransparency};
  color: ${(props) => props.theme.blue};
  padding: ${(props) => props.theme.spacing(1) + ' ' + props.theme.spacing(2)};
  margin-left: ${(props) => props.theme.spacing(2)};
  font-size: ${(props) => props.theme.fontSizeSmall};
`;
const StyledIcon = styled.div`
  margin-right: ${(props) => props.theme.spacing(1)};
  display: flex;
  align-items: center;
`;

const StyledDelete = styled.div`
  margin-left: ${(props) => props.theme.spacing(2)};
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  font-size: ${(props) => props.theme.fontSizeSmall};
  margin-top: 1px;
`;

const StyledLabelKey = styled.div`
  font-weight: 500;
`;

function SortOrFilterChip({
  id,
  labelKey,
  labelValue,
  icon,
  onRemove,
}: OwnProps) {
  return (
    <StyledChip>
      <StyledIcon>{icon}</StyledIcon>
      {labelKey && <StyledLabelKey>{labelKey}:&nbsp;</StyledLabelKey>}
      {labelValue}
      <StyledDelete onClick={onRemove} data-testid={'remove-icon-' + id}>
        <TbX />
      </StyledDelete>
    </StyledChip>
  );
}

export default SortOrFilterChip;
