import styled from '@emotion/styled';
import {
  Banner,
  type BannerVariant,
  type IconComponent,
  IconX,
} from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';

const StyledText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledCloseButton = styled(IconButton)`
  margin-left: auto;
`;

export const InformationBanner = ({
  message,
  variant = 'default',
  buttonTitle,
  buttonIcon,
  buttonOnClick,
  isButtonDisabled = false,
  onClose,
}: {
  message: string;
  variant?: BannerVariant;
  buttonTitle?: string;
  buttonIcon?: IconComponent;
  buttonOnClick?: () => void;
  isButtonDisabled?: boolean;
  onClose?: () => void;
}) => {
  return (
    <Banner variant={variant}>
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
      {onClose && (
        <StyledCloseButton
          Icon={IconX}
          size="small"
          variant="tertiary"
          onClick={onClose}
          ariaLabel="Close banner"
        />
      )}
    </Banner>
  );
};
