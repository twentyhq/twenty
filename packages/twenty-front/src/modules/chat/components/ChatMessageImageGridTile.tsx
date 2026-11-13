import { useLingui } from '@lingui/react/macro';
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
  position: relative;

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

const StyledHiddenImageCount = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.overlayPrimary};
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  inset: 0;
  justify-content: center;
  position: absolute;
`;

type ChatMessageImageGridTileProps = {
  file: FieldFilesValue;
  hiddenImageCount?: number;
  onClick: () => void;
};

export const ChatMessageImageGridTile = ({
  file,
  hiddenImageCount,
  onClick,
}: ChatMessageImageGridTileProps) => {
  const { t } = useLingui();
  const [failedImageUrl, setFailedImageUrl] = useState<string | undefined>();

  const hasImageFailedToLoad =
    isDefined(failedImageUrl) && failedImageUrl === file.url;
  const hasHiddenImages = isDefined(hiddenImageCount);

  return (
    <StyledTileButton
      type="button"
      aria-label={
        hasHiddenImages ? t`Show ${hiddenImageCount} more images` : file.label
      }
      onClick={onClick}
    >
      {hasImageFailedToLoad ? (
        <FileIcon fileCategory={FILE_CATEGORIES.IMAGE} />
      ) : (
        <StyledTileImage
          src={file.url}
          alt={hasHiddenImages ? '' : file.label}
          loading="lazy"
          onError={() => setFailedImageUrl(file.url)}
        />
      )}
      {hasHiddenImages && (
        <StyledHiddenImageCount aria-hidden>
          +{hiddenImageCount}
        </StyledHiddenImageCount>
      )}
    </StyledTileButton>
  );
};
