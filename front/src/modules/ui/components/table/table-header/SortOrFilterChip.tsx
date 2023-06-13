import { ReactNode } from 'react';
import { TbX } from 'react-icons/tb';
import styled from '@emotion/styled';

type OwnProps = {
  id: string;
  labelKey?: string;
  labelValue: string;
  icon: ReactNode;
  onRemove: () => void;
};

const StyledChip = styled.div`
  align-items: center;
  background-color: ${(props) => props.theme.blueHighTransparency};
  border: 1px solid ${(props) => props.theme.blueLowTransparency};
  border-radius: 50px;
  color: ${(props) => props.theme.blue};
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  font-size: ${(props) => props.theme.fontSizeSmall};
  padding: ${(props) => props.theme.spacing(1) + ' ' + props.theme.spacing(2)};
`;
const StyledIcon = styled.div`
  align-items: center;
  display: flex;
  margin-right: ${(props) => props.theme.spacing(1)};
`;

const StyledDelete = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  font-size: ${(props) => props.theme.fontSizeSmall};
  margin-left: ${(props) => props.theme.spacing(2)};
  margin-top: 1px;
  user-select: none;
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
