import * as React from 'react';
import { Link as ReactLink } from 'react-router-dom';
import styled from '@emotion/styled';

type OwnProps = {
  className?: string;
  href: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const StyledClickable = styled.div`
  display: flex;

  a {
    color: inherit;
  }
`;

export function RawLink({ className, href, children, onClick }: OwnProps) {
  return (
    <StyledClickable className={className}>
      <ReactLink onClick={onClick} to={href}>
        {children}
      </ReactLink>
    </StyledClickable>
  );
}
