import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { ChatMessageImageGridTile } from '@/chat/components/ChatMessageImageGridTile';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useOpenFilePreview } from '@/ui/field/display/hooks/useOpenFilePreview';

const CHAT_MESSAGE_IMAGE_GRID_TILE_MAX_SIZE = '140px';

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

  const columnCount = files.length === 4 ? 2 : Math.min(files.length, 3);

  return (
    <StyledGrid columnCount={columnCount}>
      {files.map((file) => (
        <ChatMessageImageGridTile
          key={file.fileId}
          file={file}
          onClick={openFilePreview}
        />
      ))}
    </StyledGrid>
  );
};
