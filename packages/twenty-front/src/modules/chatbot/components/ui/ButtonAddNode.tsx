/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import styled from '@emotion/styled';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { memo } from 'react';
import { useIcons } from 'twenty-ui/display';

const StyledButtonNodeWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.background.quaternary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: rgba(100, 100, 111, 0.15) 0px 4px 16px 0px;
  padding: ${({ theme }) => theme.spacing(2)};
  height: 24px;
  width: 24px;
`;

const StyledButton = styled.button`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  background-color: ${({ theme }) => theme.background.primary};
  border: none;
  cursor: pointer;
  height: 100%;

  div {
    color: ${({ theme }) => theme.background.primaryInverted};
  }

  &:hover {
    background-color: ${({ theme }) => theme.background.secondary};
  }

  &:active {
    background-color: ${({ theme }) => theme.background.tertiary};
    border: 1px solid ${({ theme }) => theme.color.blue};
  }
`;

function AddNode({ isConnectable }: NodeProps<Node<{ newNode: boolean }>>) {
  const { getIcon } = useIcons();
  const Icon = getIcon('IconPlus');
  const iconPlus = <Icon size={18}></Icon>;
  const { toggleCommandMenu } = useCommandMenu();

  return (
    <StyledButtonNodeWrapper>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <StyledButton onClick={toggleCommandMenu}>
        <div>{iconPlus}</div>
      </StyledButton>
    </StyledButtonNodeWrapper>
  );
}

export default memo(AddNode);
