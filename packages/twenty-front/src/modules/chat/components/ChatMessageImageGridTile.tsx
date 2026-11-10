import { styled } from '@linaria/react';
import { useState } from 'react';
import { FILE_CATEGORIES } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { FileIcon } from '@/file/components/FileIcon';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';

const StyledTileButton = styled.button`
  align-items: center;
  aspect-ratio: 1;
  background: ${themeCssVariables.background.tertiary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: flex;
  justify-content: center;
  overflow: hidden;
  padding: 0;

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -1px;
  }
`;

const StyledTileImage = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

type ChatMessageImageGridTileProps = {
  file: FieldFilesValue;
  onClick: (file: FieldFilesValue) => void;
};

export const ChatMessageImageGridTile = ({
  file,
  onClick,
}: ChatMessageImageGridTileProps) => {
  const [failedImageUrl, setFailedImageUrl] = useState<string | undefined>();

  const hasImageFailedToLoad =
    isDefined(failedImageUrl) && failedImageUrl === file.url;

  return (
    <StyledTileButton
      type="button"
      aria-label={file.label}
      onClick={() => onClick(file)}
    >
      {hasImageFailedToLoad ? (
        <FileIcon fileCategory={FILE_CATEGORIES.IMAGE} />
      ) : (
        <StyledTileImage
          src={file.url}
          alt={file.label}
          loading="lazy"
          onError={() => setFailedImageUrl(file.url)}
        />
      )}
    </StyledTileButton>
  );
};
