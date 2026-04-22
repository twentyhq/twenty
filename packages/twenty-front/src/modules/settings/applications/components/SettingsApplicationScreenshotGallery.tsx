import { styled } from '@linaria/react';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsApplicationScreenshotGalleryProps = {
  screenshots: string[];
  displayName: string;
};

const StyledGalleryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[6]};
  min-width: 0;
  width: 100%;
`;

const StyledScreenshotsContainer = styled.div`
  align-items: center;
  aspect-ratio: 8 / 5;
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  justify-content: center;
  overflow: hidden;
`;

const StyledScreenshotImage = styled.img`
  height: 100%;
  object-fit: cover;
  object-position: center;
  width: 100%;
`;

const StyledScreenshotThumbnails = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  overflow-x: auto;
`;

const StyledThumbnail = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid
    ${({ isSelected }) =>
      isSelected
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  flex: 0 0 96px;
  height: 56px;
  justify-content: center;
  overflow: hidden;

  &:hover {
    border-color: ${themeCssVariables.color.blue};
  }
`;

const StyledThumbnailImage = styled.img`
  height: 100%;
  object-fit: cover;
  object-position: center;
  width: 100%;
`;

export const SettingsApplicationScreenshotGallery = ({
  screenshots,
  displayName,
}: SettingsApplicationScreenshotGalleryProps) => {
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(0);

  if (screenshots.length === 0) {
    return null;
  }

  const safeIndex = Math.min(selectedScreenshotIndex, screenshots.length - 1);

  return (
    <StyledGalleryContainer>
      <StyledScreenshotsContainer>
        <StyledScreenshotImage
          src={screenshots[safeIndex]}
          alt={`${displayName} screenshot ${safeIndex + 1}`}
        />
      </StyledScreenshotsContainer>
      <StyledScreenshotThumbnails>
        {screenshots.slice(0, 6).map((screenshot, index) => (
          <StyledThumbnail
            key={index}
            isSelected={index === selectedScreenshotIndex}
            onClick={() => setSelectedScreenshotIndex(index)}
          >
            <StyledThumbnailImage
              src={screenshot}
              alt={`${displayName} thumbnail ${index + 1}`}
            />
          </StyledThumbnail>
        ))}
      </StyledScreenshotThumbnails>
    </StyledGalleryContainer>
  );
};
