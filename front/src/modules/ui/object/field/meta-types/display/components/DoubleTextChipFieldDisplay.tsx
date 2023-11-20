import { useDoubleTextChipField } from '../../hooks/useDoubleTextChipField';
import { ChipDisplay } from '../content-display/components/ChipDisplay';

export const DoubleTextChipFieldDisplay = () => {
  const { avatarUrl, firstValue, secondValue, entityId } =
    useDoubleTextChipField();

  const content = [firstValue, secondValue].filter(Boolean).join(' ');

  return (
    <ChipDisplay
      displayName={content}
      avatarUrlValue={avatarUrl}
      entityId={entityId}
    />
  );
};
