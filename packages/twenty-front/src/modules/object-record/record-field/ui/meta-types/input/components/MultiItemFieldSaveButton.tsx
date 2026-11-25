import { LightIconButton } from 'twenty-ui/components/input';
import { IconCheck, IconPlus } from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';

type MultiItemFieldSaveButtonProps = {
  isAddingNewItem: boolean;
  onClick: () => void;
};

export const MultiItemFieldSaveButton = ({
  isAddingNewItem,
  onClick,
}: MultiItemFieldSaveButtonProps) => {
  const { t } = useLingui();
  return (
    <LightIconButton
      onClick={onClick}
      aria-label={isAddingNewItem ? t`Add item` : t`Save item`}
    >
      {isAddingNewItem ? <IconPlus /> : <IconCheck />}
    </LightIconButton>
  );
};
