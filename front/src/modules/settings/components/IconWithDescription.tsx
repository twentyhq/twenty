import { IconComponent } from '@/ui/icon/types/IconComponent';

type IconWithDescriptionProps = {
  Icon: IconComponent;
  description: string;
};

export const IconWithDescription = ({
  Icon,
  description,
}: IconWithDescriptionProps) => {
  return (
    <div>
      <Icon />
      <div>{description}</div>
    </div>
  );
};
