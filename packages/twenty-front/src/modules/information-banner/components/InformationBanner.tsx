import { Button } from '@/ui/input/button/components/Button';
import styled from '@emotion/styled';
import { Banner, IconComponent } from 'twenty-ui';

const StyledBanner = styled(Banner)`
position: absolute;
`

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
      {message}
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
