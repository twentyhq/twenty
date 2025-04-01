import styled from '@emotion/styled';
import { Handle, Position } from '@xyflow/react';
import { ReactNode } from 'react';
import { Label, useIcons } from 'twenty-ui';

const BaseNodeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 250px;
  border: 1px solid ${({ theme }) => theme.background.quaternary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.background.primary};
  gap: ${({ theme }) => theme.spacing(2)};
  box-shadow: rgba(100, 100, 111, 0.15) 0px 4px 16px 0px;
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.background.primaryInverted};
  font-weight: 500;

  p {
    margin: 0;
  }

  .icon {
    background-color: ${({ theme }) => theme.background.secondary};
    border: 1px solid ${({ theme }) => theme.background.quaternary};
    border-radius: ${({ theme }) => theme.border.radius.sm};
    padding: ${({ theme }) => theme.spacing(1)};
    color: ${({ theme }) => theme.font.color.tertiary};
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const StyledNodeType = styled.div`
  width: max-content;
  background-color: ${({ theme }) => theme.color.blue};
  align-self: center;
  border-radius: ${({ theme }) =>
    `${theme.border.radius.sm} ${theme.border.radius.sm} 0 0`};
  margin-left: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(0.5)}
    ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.background.primary};
  font-weight: 600;
`.withComponent(Label);

const BaseNode = ({
  icon,
  title,
  children,
  nodeStart,
  isConnectable,
}: {
  icon?: string;
  title?: string;
  children: ReactNode;
  nodeStart?: boolean;
  isConnectable: boolean;
}) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(icon);

  const iconHeader = <Icon size={18}></Icon>;

  return (
    <>
      {!nodeStart && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
      )}
      {nodeStart && <StyledNodeType variant="small">Start</StyledNodeType>}
      <BaseNodeWrapper>
        <StyledHeader>
          {icon && <div className="icon">{iconHeader}</div>}
          {title && <p>{title}</p>}
        </StyledHeader>
        {children}
      </BaseNodeWrapper>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </>
  );
};

export default BaseNode;
