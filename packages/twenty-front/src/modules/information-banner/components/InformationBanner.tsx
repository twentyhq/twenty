import { styled } from '@linaria/react';
import {
  Banner,
  type BannerVariant,
  type IconComponent,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const InformationBanner = ({
  message,
  variant = 'default',
  buttonTitle,
  buttonIcon,
  buttonOnClick,
  isButtonDisabled = false,
}: {
  message: string;
  variant?: BannerVariant;
  buttonTitle?: string;
  buttonIcon?: IconComponent;
  buttonOnClick?: () => void;
  isButtonDisabled?: boolean;
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
    </Banner>
  );
};
