import { InformationBannerComponentInstanceContext } from '@/information-banner/states/contexts/InformationBannerComponentInstanceContext';
import { informationBannerIsOpenComponentState } from '@/information-banner/states/informationBannerIsOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  Banner,
  type BannerColor,
  type BannerVariant,
  type IconComponent,
  IconX,
} from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledInvertedIconButton = styled(IconButton)`
  color: ${themeCssVariables.font.color.inverted} !important;
`;

const StyledSecondaryIconButton = styled(IconButton)`
  color: inherit !important;
`;

const StyledContent = styled.div<{ hasCloseButton: boolean }>`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: center;
  margin-left: ${({ hasCloseButton }) => (hasCloseButton ? '24px' : '0')};
`;

export const InformationBanner = ({
  message,
  color = 'blue',
  variant = 'primary',
  buttonTitle,
  buttonIcon,
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

  const CloseIconButton = isPrimary
    ? StyledInvertedIconButton
    : StyledSecondaryIconButton;

  return (
    <InformationBannerComponentInstanceContext.Provider
      value={{
        instanceId: componentInstanceId,
      }}
    >
      {informationBannerIsOpen && (
        <Banner color={color} variant={variant}>
          <StyledContent hasCloseButton={!!onClose}>
            <StyledText>{message}</StyledText>
            {buttonTitle && buttonOnClick && (
              <Button
                variant="secondary"
                title={buttonTitle}
                Icon={buttonIcon}
                size="small"
                inverted={isPrimary}
                onClick={buttonOnClick}
                disabled={isButtonDisabled}
              />
            )}
          </StyledContent>
          {onClose && (
            <CloseIconButton
              Icon={IconX}
              size="small"
              variant="tertiary"
              onClick={onClose}
              ariaLabel={t`Close banner`}
            />
          )}
        </Banner>
      )}
    </InformationBannerComponentInstanceContext.Provider>
  );
};
