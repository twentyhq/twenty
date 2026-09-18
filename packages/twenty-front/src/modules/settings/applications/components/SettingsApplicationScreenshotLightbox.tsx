import { Dialog } from 'twenty-ui/primitives/surfaces';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Key } from 'ts-key-enum';
import { IconChevronLeft, IconChevronRight, IconX } from 'twenty-ui/icon';
import { FloatingIconButton } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsApplicationScreenshotLightboxProps = {
  modalInstanceId: string;
  screenshots: string[];
  displayName: string;
  selectedIndex: number;
  onSelectedIndexChange: (index: number) => void;
  onClose: () => void;
};

const StyledContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  height: 100%;
  justify-content: center;
  padding: ${themeCssVariables.spacing[16]};
  position: relative;
  width: 100%;
`;

const StyledImage = styled.img`
  display: block;
  max-height: 100%;
  max-width: 100%;
  min-height: 0;
  object-fit: contain;
`;

const StyledCounter = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledCloseButton = styled.div`
  position: absolute;
  right: ${themeCssVariables.spacing[4]};
  top: ${themeCssVariables.spacing[4]};
`;

const StyledPreviousButton = styled.div`
  left: ${themeCssVariables.spacing[4]};
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
`;

const StyledNextButton = styled.div`
  position: absolute;
  right: ${themeCssVariables.spacing[4]};
  top: 50%;
  transform: translateY(-50%);
`;

export const SettingsApplicationScreenshotLightbox = ({
  modalInstanceId,
  screenshots,
  displayName,
  selectedIndex,
  onSelectedIndexChange,
  onClose,
}: SettingsApplicationScreenshotLightboxProps) => {
  const screenshotCount = screenshots.length;
  const hasSeveralScreenshots = screenshotCount > 1;

  const showPrevious = () =>
    onSelectedIndexChange(
      (selectedIndex - 1 + screenshotCount) % screenshotCount,
    );

  const showNext = () =>
    onSelectedIndexChange((selectedIndex + 1) % screenshotCount);

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowLeft],
    callback: showPrevious,
    focusId: modalInstanceId,
    dependencies: [selectedIndex, screenshotCount],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowRight],
    callback: showNext,
    focusId: modalInstanceId,
    dependencies: [selectedIndex, screenshotCount],
  });

  return (
    <DialogInstance
      dialogId={modalInstanceId}
      dismissible
      onClose={onClose}
      renderInDocumentBody
    >
      {({ container, backdrop, viewportProps, onKeyDown }) => (
        <Dialog.Popup
          aria-label={displayName}
          {...{ container, backdrop, viewportProps, onKeyDown }}
          size="fullscreen"
          style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}
        >
          <StyledContainer>
            <StyledCloseButton>
              <FloatingIconButton
                Icon={IconX}
                ariaLabel={t`Close`}
                onClick={onClose}
              />
            </StyledCloseButton>
            {hasSeveralScreenshots && (
              <StyledPreviousButton>
                <FloatingIconButton
                  Icon={IconChevronLeft}
                  ariaLabel={t`Previous screenshot`}
                  onClick={showPrevious}
                />
              </StyledPreviousButton>
            )}
            <StyledImage
              src={screenshots[selectedIndex]}
              alt={`${displayName} screenshot ${selectedIndex + 1}`}
            />
            {hasSeveralScreenshots && (
              <>
                <StyledNextButton>
                  <FloatingIconButton
                    Icon={IconChevronRight}
                    ariaLabel={t`Next screenshot`}
                    onClick={showNext}
                  />
                </StyledNextButton>
                <StyledCounter>
                  {selectedIndex + 1} / {screenshotCount}
                </StyledCounter>
              </>
            )}
          </StyledContainer>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
