import { isDefined } from 'twenty-shared/utils';
import { BUTTON_INVERTED_CLASS_NAME } from '@/ui/input/styles/ButtonInvertedClassName';
import { InformationBannerComponentInstanceContext } from '@/information-banner/states/contexts/InformationBannerComponentInstanceContext';
import { informationBannerIsOpenComponentState } from '@/information-banner/states/informationBannerIsOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { t } from '@lingui/core/macro';
import {
  Banner,
  type BannerColor,
  type BannerVariant,
} from 'twenty-ui/primitives/feedback';
import { type IconComponent, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { IconButton } from 'twenty-ui/components';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
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
  const buttonAccent = color === 'danger' ? 'danger' : 'blue';

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
                color={buttonAccent === 'blue' ? 'accent' : 'danger'}
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
                color={buttonAccent === 'blue' ? 'accent' : 'danger'}
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
