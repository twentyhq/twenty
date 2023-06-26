import { css } from '@emotion/react';

export const overlayBackground = (props: any) =>
  css`
    backdrop-filter: blur(8px);
    background: ${props.theme.background.secondaryTransparent};
    box-shadow: ${props.theme.modalBoxShadow};
  `;

export const textInputStyle = (props: any) =>
  css`
    background-color: transparent;
    border: none;
    color: ${props.theme.font.color.primary};
    outline: none;
    padding: ${props.theme.spacing(0)} ${props.theme.spacing(2)};

    &::placeholder,
    &::-webkit-input-placeholder {
      color: ${props.theme.font.color.light};
      font-family: ${props.theme.font.family};
      font-weight: ${props.theme.font.weight.medium};
    }
  `;

export const hoverBackground = (props: any) =>
  css`
    transition: background 0.1s ease;
    &:hover {
      background: ${props.theme.background.transparent.light};
    }
  `;
