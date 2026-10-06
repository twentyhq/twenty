import { InformationBannerComponentInstanceContext } from '@/information-banner/states/contexts/InformationBannerComponentInstanceContext';
import { informationBannerIsOpenComponentState } from '@/information-banner/states/informationBannerIsOpenComponentState';
import { BUTTON_INVERTED_CLASS_NAME } from '@/ui/input/styles/ButtonInvertedClassName';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { type IconComponent, IconX } from 'twenty-ui/icon';
import {
  Banner,
  type BannerColor,
  type BannerStatus,
  type BannerVariant,
} from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

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
  color,
  status = 'info',
  variant = 'solid',
  buttonTitle,
  buttonIcon: ButtonIcon,
  buttonOnClick,
  isButtonDisabled = false,
  onClose,
  componentInstanceId,
}: {
  message: string;
  color?: BannerColor;
  status?: BannerStatus;
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

  const isSolid = variant === 'solid';
  const buttonColor =
    color === 'red' || (!isDefined(color) && status === 'error')
      ? 'danger'
      : 'accent';

  return (
    <InformationBannerComponentInstanceContext.Provider
      value={{
        instanceId: componentInstanceId,
      }}
    >
      {informationBannerIsOpen && (
        <Banner color={color} status={status} variant={variant}>
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
                className={isSolid ? BUTTON_INVERTED_CLASS_NAME : undefined}
                startIcon={isDefined(ButtonIcon) ? <ButtonIcon /> : undefined}
                size="sm"
                onClick={buttonOnClick}
                disabled={isButtonDisabled}
                variant="outline"
                color={isSolid ? 'neutral' : buttonColor}
              >
                {buttonTitle}
              </Button>
            )}
          </StyledContent>
          {onClose &&
            (isSolid ? (
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
