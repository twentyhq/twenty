import styled from '@emotion/styled';
import { Banner, BannerVariant, Button, IconComponent } from 'twenty-ui';

const StyledBanner = styled(Banner)`
  position: absolute;
`;

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
    <StyledBanner variant={variant}>
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
    </StyledBanner>
  );
};
