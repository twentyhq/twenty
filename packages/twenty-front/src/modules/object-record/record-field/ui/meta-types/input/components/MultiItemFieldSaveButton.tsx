import { t } from '@lingui/core/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconCheck, IconPlus } from 'twenty-ui/icon';

type MultiItemFieldSaveButtonProps = {
  isAddingNewItem: boolean;
  onClick: () => void;
};

export const MultiItemFieldSaveButton = ({
  isAddingNewItem,
  onClick,
}: MultiItemFieldSaveButtonProps) => (
  <LightIconButton
    onClick={onClick}
    aria-label={isAddingNewItem ? t`Add item` : t`Save item`}
  >
    {isAddingNewItem ? <IconPlus /> : <IconCheck />}
  </LightIconButton>
);
