import { ComponentType } from 'react';
import styled from '@emotion/styled';

const StyledIconButton = styled.button`
  align-items: center;
  background: ${({ theme }) => theme.color.blue};
  border: none;

  border-radius: 50%;
  color: ${({ theme }) => theme.font.color.inverted};

  cursor: pointer;
  display: flex;
  height: 20px;

  justify-content: center;

  outline: none;
  padding: 0;
  transition: color 0.1s ease-in-out, background 0.1s ease-in-out;

  &:disabled {
    background: ${({ theme }) => theme.background.quaternary};
    color: ${({ theme }) => theme.font.color.tertiary};
    cursor: default;
  }
  width: 20px;
`;

type Props<T> = {
  Icon: ComponentType<T>;
  iconProps?: T;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function RoundedIconButton<T extends Record<string, unknown>>({
  Icon,
  iconProps,
  ...props
}: Props<T>) {
  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <StyledIconButton {...props}>{<Icon {...iconProps} />}</StyledIconButton>
  );
}
