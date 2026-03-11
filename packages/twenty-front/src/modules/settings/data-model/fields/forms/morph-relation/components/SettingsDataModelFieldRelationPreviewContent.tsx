import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

const StyledPreviewContent = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: ${({ isMobile }) => (isMobile ? 'column' : 'row')};
  gap: 6px;
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
