import { SettingsApplicationScreenshotLightbox } from '@/settings/applications/components/SettingsApplicationScreenshotLightbox';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

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

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 2px;
  }
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

const StyledThumbnail = styled.button`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  flex: 0 0 88px;
  height: 56px;
  overflow: hidden;
  padding: 0;

  &:hover {
    border-color: ${themeCssVariables.border.color.strong};
  }

  &[aria-pressed='true'] {
    border-color: ${themeCssVariables.color.blue};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -2px;
  }
`;

const StyledThumbnailImage = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

export const SettingsApplicationScreenshotGallery = ({
  screenshots: allScreenshots,
  displayName,
}: SettingsApplicationScreenshotGalleryProps) => {
  const [selectedScreenshot, setSelectedScreenshot] = useState<
    string | undefined
  >(undefined);
  const [failedScreenshots, setFailedScreenshots] = useState<string[]>([]);
  const { openDialog, closeDialog } = useDialog();
  const lightboxModalId = useId();

  const screenshots = Array.from(new Set(allScreenshots)).filter(
    (screenshot) => !failedScreenshots.includes(screenshot),
  );

  const markScreenshotAsFailed = (screenshot: string) =>
    setFailedScreenshots((previousFailedScreenshots) =>
      previousFailedScreenshots.includes(screenshot)
        ? previousFailedScreenshots
        : [...previousFailedScreenshots, screenshot],
    );

  if (screenshots.length === 0) {
    return null;
  }

  const safeIndex = Math.max(
    isDefined(selectedScreenshot) ? screenshots.indexOf(selectedScreenshot) : 0,
    0,
  );

  const selectScreenshotAt = (index: number) =>
    setSelectedScreenshot(screenshots[index]);

  const getScreenshotAltText = (index: number) => {
    const screenshotNumber = index + 1;

    return t`${displayName} screenshot ${screenshotNumber}`;
  };

  return (
    <StyledGalleryContainer>
      <StyledHeroButton
        type="button"
        aria-label={t`View screenshot in full screen`}
        onClick={() => openDialog(lightboxModalId)}
      >
        <StyledHeroImage
          src={screenshots[safeIndex]}
          alt={getScreenshotAltText(safeIndex)}
          onError={() => markScreenshotAsFailed(screenshots[safeIndex])}
        />
      </StyledHeroButton>
      {screenshots.length > 1 && (
        <StyledThumbnails>
          {screenshots.map((screenshot, index) => (
            <StyledThumbnail
              key={screenshot}
              type="button"
              aria-pressed={index === safeIndex}
              aria-label={getScreenshotAltText(index)}
              onClick={() => setSelectedScreenshot(screenshot)}
            >
              <StyledThumbnailImage
                src={screenshot}
                alt=""
                onError={() => markScreenshotAsFailed(screenshot)}
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
        onSelectedIndexChange={selectScreenshotAt}
        onClose={() => closeDialog(lightboxModalId)}
      />
    </StyledGalleryContainer>
  );
};
