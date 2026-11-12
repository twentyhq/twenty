import { styled } from '@linaria/react';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { ChatMessageImageGridTile } from '@/chat/components/ChatMessageImageGridTile';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useOpenFilePreview } from '@/ui/field/display/hooks/useOpenFilePreview';

const CHAT_MESSAGE_IMAGE_GRID_TILE_MAX_SIZE = '140px';
const CHAT_MESSAGE_IMAGE_GRID_COLLAPSED_TILE_COUNT = 4;

const StyledGrid = styled.div<{ columnCount: number }>`
  display: grid;
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: ${({ columnCount }) =>
    `repeat(${columnCount}, minmax(0, ${CHAT_MESSAGE_IMAGE_GRID_TILE_MAX_SIZE}))`};
  max-width: 100%;
`;

type ChatMessageImageGridProps = {
  files: FieldFilesValue[];
};

export const ChatMessageImageGrid = ({ files }: ChatMessageImageGridProps) => {
  const { openFilePreview } = useOpenFilePreview();
  const [isExpanded, setIsExpanded] = useState(false);

  const isCollapsed =
    !isExpanded && files.length > CHAT_MESSAGE_IMAGE_GRID_COLLAPSED_TILE_COUNT;
  const visibleFiles = isCollapsed
    ? files.slice(0, CHAT_MESSAGE_IMAGE_GRID_COLLAPSED_TILE_COUNT)
    : files;
  const lastVisibleIndex = visibleFiles.length - 1;
  const columnCount =
    visibleFiles.length === 4 ? 2 : Math.min(visibleFiles.length, 3);

  return (
    <StyledGrid columnCount={columnCount}>
      {visibleFiles.map((file, index) => {
        const isHiddenImagesTile = isCollapsed && index === lastVisibleIndex;

        return (
          <ChatMessageImageGridTile
            key={file.fileId}
            file={file}
            hiddenImageCount={
              isHiddenImagesTile ? files.length - lastVisibleIndex : undefined
            }
            onClick={
              isHiddenImagesTile
                ? () => setIsExpanded(true)
                : () => openFilePreview(file)
            }
          />
        );
      })}
    </StyledGrid>
  );
};
