import { css } from '@emotion/react';

export const overlayBackground = (props: any) =>
  css`
    backdrop-filter: blur(8px);
    background: ${props.theme.secondaryBackgroundTransparent};
    box-shadow: ${props.theme.modalBoxShadow};
  `;

export const textInputStyle = (props: any) =>
  css`
    background-color: transparent;
    border: none;
    color: ${props.theme.text80};
    outline: none;

    &::placeholder,
    &::-webkit-input-placeholder {
      color: ${props.theme.text30};
      font-family: ${props.theme.fontFamily};
      font-weight: ${props.theme.fontWeightMedium};
    }
  `;

export const hoverBackground = (props: any) =>
  css`
    transition: background 0.1s ease;
    &:hover {
      background: ${props.theme.lightBackgroundTransparent};
    }
  `;
