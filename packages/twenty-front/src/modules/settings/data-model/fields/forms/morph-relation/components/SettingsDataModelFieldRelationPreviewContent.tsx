import styled from '@emotion/styled';
import { type ReactNode } from 'react';

const StyledPreviewContent = styled.div<{ isMobile: boolean }>`
  display: flex;
  gap: 6px;
  flex-direction: ${({ isMobile }) => (isMobile ? 'column' : 'row')};
`;

export const SettingsDataModelFieldRelationPreviewContent = ({
  isMobile,
  children,
}: {
  isMobile: boolean;
  children: ReactNode;
}) => {
  return (
    <StyledPreviewContent isMobile={isMobile}>{children}</StyledPreviewContent>
  );
};
