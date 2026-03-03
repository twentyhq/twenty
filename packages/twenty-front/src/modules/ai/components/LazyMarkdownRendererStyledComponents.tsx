import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledMarkdownContainer = styled.div`
  border-radius: ${themeCssVariables.border.radius.sm};
  line-height: 150%;
  margin: ${themeCssVariables.spacing['1.5']} 0;
  position: relative;
  scroll-margin-top: ${themeCssVariables.spacing[10]};
  scroll-margin-bottom: ${themeCssVariables.spacing[10]};

  &:empty {
    display: none;
  }

  .markdown-link {
    color: ${themeCssVariables.accent.accent11};
    text-decoration: none;
    -webkit-text-decoration: none;
  }

  .markdown-link:visited {
    color: ${themeCssVariables.accent.accent11};
  }

  .markdown-link:hover {
    text-decoration: underline !important;
  }

  strong,
  b {
    font-weight: ${themeCssVariables.font.weight.semiBold};
  }

  h1,
  h2,
  h3 {
    font-weight: ${themeCssVariables.font.weight.semiBold} !important;
  }

  h1 {
    font-size: 1.6em;
    line-height: 1.25;
    margin-bottom: 12px;
    margin-top: 24px;
  }

  h2 {
    font-size: 1.3em;
    line-height: 1.25;
    margin-bottom: 10px;
    margin-top: 20px;
  }

  h3 {
    font-size: 1.15em;
    line-height: 1.25;
    margin-bottom: 8px;
    margin-top: 18px;
  }

  h4 {
    font-size: 1.05em;
    line-height: 1.25;
    margin-bottom: 8px;
    margin-top: 16px;
  }

  h5 {
    font-size: 0.95em;
    line-height: 1.25;
    margin-bottom: 6px;
    margin-top: 14px;
  }

  h6 {
    font-size: 0.85em;
    line-height: 1.25;
    margin-bottom: 6px;
    margin-top: 12px;
  }

  hr {
    background-color: ${themeCssVariables.border.color.light} !important;
    border: none;
    height: 1px;
    margin: ${themeCssVariables.spacing[4]} 0;
  }

  ol:first-of-type:not(.nested),
  ul:first-of-type:not(.nested) {
    margin-top: ${themeCssVariables.spacing[1]} !important;
  }

  ol:last-of-type:not(.nested),
  ul:last-of-type:not(.nested) {
    margin-bottom: ${themeCssVariables.spacing[1]} !important;
  }

  li {
    line-height: 150%;
    margin-bottom: ${themeCssVariables.spacing['0.5']} !important;
    margin-top: ${themeCssVariables.spacing['0.5']} !important;
    padding-bottom: ${themeCssVariables.spacing['0.5']} !important;
    padding-top: ${themeCssVariables.spacing['0.5']} !important;
  }

  :not(pre) > code {
    background-color: ${themeCssVariables.background.tertiary};
    border-radius: ${themeCssVariables.border.radius.sm};
    color: ${themeCssVariables.font.color.primary};
    font-family: ${themeCssVariables.code.font.family}, monospace;
    font-size: 0.9em;
    padding: 1.5px 3px;
    transition: all calc(${themeCssVariables.animation.duration.fast} * 1s) ease;
  }

  :not(pre) > code[style*='cursor: pointer'] {
    background-color: ${themeCssVariables.background.secondary};
    border: 1px solid ${themeCssVariables.accent.accent10};
    color: ${themeCssVariables.accent.accent10};
  }

  :not(pre) > code[style*='cursor: pointer']:hover {
    background-color: ${themeCssVariables.background.transparent.blue};
  }

  .markdown-code-outer-container {
    border-radius: ${themeCssVariables.border.radius.md} !important;
    overflow: hidden;
  }

  .markdown-block-code {
    background-color: ${themeCssVariables.background.secondary};
    border: 1px solid ${themeCssVariables.border.color.medium};
    border-radius: ${themeCssVariables.border.radius.md} !important;
  }

  .markdown-block-code * {
    animation: none !important;
  }

  img {
    height: auto;
    max-width: 100%;
  }
`;

export const StyledParagraph = styled.div`
  line-height: inherit;
  margin-block: ${themeCssVariables.spacing[2]};

  &:first-child {
    margin-block-start: 0;
  }

  &:last-child {
    margin-block-end: 0;
  }
`;

export const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

export const StyledTableScrollContainer = styled.div`
  overflow-x: auto;

  table {
    border-collapse: collapse;
    margin-block: ${themeCssVariables.spacing[2]};
  }

  th,
  td {
    border: 1px solid ${themeCssVariables.border.color.light};
    padding: ${themeCssVariables.spacing[2]};
  }

  th {
    background-color: ${themeCssVariables.background.secondary};
    font-weight: ${themeCssVariables.font.weight.medium};
  }
`;
