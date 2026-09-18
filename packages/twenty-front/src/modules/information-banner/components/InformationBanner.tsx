import { InformationBannerComponentInstanceContext } from '@/information-banner/states/contexts/InformationBannerComponentInstanceContext';
import { informationBannerIsOpenComponentState } from '@/information-banner/states/informationBannerIsOpenComponentState';
import { BUTTON_INVERTED_CLASS_NAME } from '@/ui/input/styles/ButtonInvertedClassName';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconButton, OverflowingTextWithTooltip } from 'twenty-ui/components';
import { type IconComponent, IconX } from 'twenty-ui/icon';
import {
  Banner,
  type BannerColor,
  type BannerVariant,
} from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledText = styled.div`
  min-width: 0;
`;

const INVERTED_ICON_BUTTON_CLASS_NAME = css`
  color: ${themeCssVariables.font.color.inverted} !important;
`;

const StyledContent = styled.div<{ hasCloseButton: boolean }>`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: center;
  margin-left: ${({ hasCloseButton }) => (hasCloseButton ? '24px' : '0')};
  min-width: 0;
`;

export const InformationBanner = ({
  message,
  color = 'blue',
  variant = 'primary',
  buttonTitle,
  buttonIcon: ButtonIcon,
  buttonOnClick,
  isButtonDisabled = false,
  onClose,
  componentInstanceId,
}: {
  message: string;
  color?: BannerColor;
  variant?: BannerVariant;
  buttonTitle?: string;
  buttonIcon?: IconComponent;
  buttonOnClick?: () => void;
  isButtonDisabled?: boolean;
  onClose?: () => void;
  componentInstanceId: string;
}) => {
  const informationBannerIsOpen = useAtomComponentStateValue(
    informationBannerIsOpenComponentState,
    componentInstanceId,
  );

  const isPrimary = variant === 'primary';
  const buttonColor = color === 'danger' ? 'danger' : 'accent';

  return (
    <InformationBannerComponentInstanceContext.Provider
      value={{
        instanceId: componentInstanceId,
      }}
    >
      {informationBannerIsOpen && (
        <Banner color={color} variant={variant}>
          <StyledContent hasCloseButton={!!onClose}>
            <StyledText>
              <OverflowingTextWithTooltip
                isFocusable
                text={<>{message}</>}
                tooltipContent={message}
              />
            </StyledText>
            {buttonTitle && buttonOnClick && (
              <Button
                className={isPrimary ? BUTTON_INVERTED_CLASS_NAME : undefined}
                startIcon={isDefined(ButtonIcon) ? <ButtonIcon /> : undefined}
                size="sm"
                onClick={buttonOnClick}
                disabled={isButtonDisabled}
                variant="outline"
                color={isPrimary ? 'neutral' : buttonColor}
              >
                {buttonTitle}
              </Button>
            )}
          </StyledContent>
          {onClose &&
            (isPrimary ? (
              <IconButton
                className={INVERTED_ICON_BUTTON_CLASS_NAME}
                size="sm"
                variant="ghost"
                onClick={onClose}
                aria-label={t`Close banner`}
              >
                <IconX />
              </IconButton>
            ) : (
              <IconButton
                size="sm"
                variant="ghost"
                color={buttonColor}
                onClick={onClose}
                aria-label={t`Close banner`}
              >
                <IconX />
              </IconButton>
            ))}
        </Banner>
      )}
    </InformationBannerComponentInstanceContext.Provider>
  );
};
