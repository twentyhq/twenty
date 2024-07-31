import { Button } from '@/ui/input/button/components/Button';
import { Banner, IconComponent } from 'twenty-ui';

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
    <Banner>
      {message}
      <Button
        variant="secondary"
        title={buttonTitle}
        Icon={buttonIcon}
        size="small"
        inverted
        onClick={buttonOnClick}
      />
    </Banner>
  );
};
