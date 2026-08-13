import { type WidgetHeaderAction } from '@/page-layout/widgets/types/WidgetHeaderInfo';
import { LightIconButton } from 'twenty-ui/input';

type WidgetCardHeaderActionProps = {
  headerAction: WidgetHeaderAction;
};

export const WidgetCardHeaderAction = ({
  headerAction,
}: WidgetCardHeaderActionProps) => {
  if (headerAction.actionType === 'link') {
    return (
      <LightIconButton
        Icon={headerAction.Icon}
        aria-label={headerAction.label}
        title={headerAction.label}
        accent="tertiary"
        size="small"
        to={headerAction.to}
        disabled={headerAction.disabled}
      />
    );
  }

  return (
    <LightIconButton
      Icon={headerAction.Icon}
      aria-label={headerAction.label}
      title={headerAction.label}
      accent="tertiary"
      size="small"
      onClick={headerAction.onClick}
      disabled={headerAction.disabled}
    />
  );
};
