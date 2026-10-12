import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { styled } from '@linaria/react';

export const StyledOverlayPortalLayer = styled.div<{
  isAboveModal?: boolean;
}>`
  display: flex;
  z-index: ${({ isAboveModal }) =>
    isAboveModal
      ? RootStackingContextZIndices.DropdownPortalAboveModal
      : RootStackingContextZIndices.DropdownPortalBelowModal};
`;
