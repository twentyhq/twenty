import { SettingsApplicationScreenshotLightbox } from '@/settings/applications/components/SettingsApplicationScreenshotLightbox';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useId, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsApplicationScreenshotGalleryProps = {
  screenshots: string[];
  displayName: string;
};

const StyledGalleryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  padding-bottom: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledHeroButton = styled.button`
  aspect-ratio: 59 / 30;
  background-color: ${themeCssVariables.background.secondary};
  border: none;
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  overflow: hidden;
  padding: 0;
  width: 100%;
`;

const StyledHeroImage = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  width: 100%;
`;

const StyledThumbnails = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  overflow-x: auto;
`;

const StyledThumbnail = styled.button<{ isSelected: boolean }>`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid
    ${({ isSelected }) =>
      isSelected
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  flex: 0 0 88px;
  height: 56px;
  overflow: hidden;
  padding: 0;

  &:hover {
    border-color: ${themeCssVariables.color.blue};
  }
`;

const StyledThumbnailImage = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

export const SettingsApplicationScreenshotGallery = ({
  screenshots,
  displayName,
}: SettingsApplicationScreenshotGalleryProps) => {
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(0);
  const { openModal, closeModal } = useModal();
  const lightboxModalId = useId();

  if (screenshots.length === 0) {
    return null;
  }

  const safeIndex = Math.min(selectedScreenshotIndex, screenshots.length - 1);

  return (
    <StyledGalleryContainer>
      <StyledHeroButton
        type="button"
        aria-label={t`View screenshot in full screen`}
        onClick={() => openModal(lightboxModalId)}
      >
        <StyledHeroImage
          src={screenshots[safeIndex]}
          alt={`${displayName} screenshot ${safeIndex + 1}`}
        />
      </StyledHeroButton>
      {screenshots.length > 1 && (
        <StyledThumbnails>
          {screenshots.map((screenshot, index) => (
            <StyledThumbnail
              key={index}
              type="button"
              isSelected={index === safeIndex}
              onClick={() => setSelectedScreenshotIndex(index)}
            >
              <StyledThumbnailImage
                src={screenshot}
                alt={`${displayName} thumbnail ${index + 1}`}
              />
            </StyledThumbnail>
          ))}
        </StyledThumbnails>
      )}
      <SettingsApplicationScreenshotLightbox
        modalInstanceId={lightboxModalId}
        screenshots={screenshots}
        displayName={displayName}
        selectedIndex={safeIndex}
        onSelectedIndexChange={setSelectedScreenshotIndex}
        onClose={() => closeModal(lightboxModalId)}
      />
    </StyledGalleryContainer>
  );
};
