import { InformationBannerComponentInstanceContext } from '@/information-banner/states/contexts/InformationBannerComponentInstanceContext';
import { informationBannerIsOpenComponentState } from '@/information-banner/states/informationBannerIsOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  Banner,
  type BannerVariant,
  type IconComponent,
  IconX,
} from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledCloseButtonContainer = styled.div`
  color: ${themeCssVariables.grayScale.gray1};
  display: flex;
`;

const StyledContent = styled.div<{ hasCloseButton: boolean }>`
  align-items: center;
  justify-content: center;
  display: flex;
  flex: 1;
  margin-left: ${({ hasCloseButton }) => (hasCloseButton ? '24px' : '0')};
  gap: ${themeCssVariables.spacing[3]};
`;

export const InformationBanner = ({
  message,
  variant = 'default',
  buttonTitle,
  buttonIcon,
  buttonOnClick,
  isButtonDisabled = false,
  onClose,
  componentInstanceId,
}: {
  message: string;
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

  return (
    <InformationBannerComponentInstanceContext.Provider
      value={{
        instanceId: componentInstanceId,
      }}
    >
      {informationBannerIsOpen && (
        <Banner variant={variant}>
          <StyledContent hasCloseButton={!!onClose}>
            <StyledText>{message}</StyledText>
            {buttonTitle && buttonOnClick && (
              <Button
                variant="secondary"
                title={buttonTitle}
                Icon={buttonIcon}
                size="small"
                inverted
                onClick={buttonOnClick}
                disabled={isButtonDisabled}
              />
            )}
          </StyledContent>
          {onClose && (
            <StyledCloseButtonContainer>
              <IconButton
                Icon={IconX}
                size="small"
                variant="tertiary"
                onClick={onClose}
                ariaLabel={t`Close banner`}
              />
            </StyledCloseButtonContainer>
          )}
        </Banner>
      )}
    </InformationBannerComponentInstanceContext.Provider>
  );
};
