import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { ChatMessageImageGridTile } from '@/chat/components/ChatMessageImageGridTile';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useOpenFilePreview } from '@/ui/field/display/hooks/useOpenFilePreview';

const CHAT_MESSAGE_IMAGE_GRID_TILE_MAX_SIZE = '140px';
const CHAT_MESSAGE_IMAGE_GRID_MAX_TILE_COUNT = 4;

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

  const visibleFiles = files.slice(0, CHAT_MESSAGE_IMAGE_GRID_MAX_TILE_COUNT);
  const lastVisibleIndex = visibleFiles.length - 1;
  const hasHiddenImages = files.length > visibleFiles.length;
  const columnCount =
    visibleFiles.length === 4 ? 2 : Math.min(visibleFiles.length, 3);

  return (
    <StyledGrid columnCount={columnCount}>
      {visibleFiles.map((file, index) => (
        <ChatMessageImageGridTile
          key={file.fileId}
          file={file}
          hiddenImageCount={
            hasHiddenImages && index === lastVisibleIndex
              ? files.length - lastVisibleIndex
              : undefined
          }
          onClick={() => openFilePreview(file, files)}
        />
      ))}
    </StyledGrid>
  );
};
