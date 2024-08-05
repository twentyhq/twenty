import { Button } from '@/ui/input/button/components/Button';
import styled from '@emotion/styled';
import { Banner, IconComponent } from 'twenty-ui';

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
  buttonTitle,
  buttonIcon,
  buttonOnClick,
}: {
  message: string;
  buttonTitle: string;
  buttonIcon?: IconComponent;
  buttonOnClick: () => void;
}) => {
  return (
    <StyledBanner>
      <StyledText>{message}</StyledText>
      <Button
        variant="secondary"
        title={buttonTitle}
        Icon={buttonIcon}
        size="small"
        inverted
        onClick={buttonOnClick}
      />
    </StyledBanner>
  );
};
