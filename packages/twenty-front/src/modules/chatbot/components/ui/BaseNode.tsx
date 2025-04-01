import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { useIcons } from 'twenty-ui';

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

const BaseNode = ({
  icon,
  title,
  children,
}: {
  icon?: string;
  title?: string;
  children: ReactNode;
}) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(icon);

  const iconHeader = <Icon size={18}></Icon>;

  return (
    <BaseNodeWrapper>
      <StyledHeader>
        {icon && <div className="icon">{iconHeader}</div>}
        {title && <p>{title}</p>}
      </StyledHeader>
      {children}
    </BaseNodeWrapper>
  );
};

export default BaseNode;
