import { useDoubleTextChipField } from '../../hooks/useDoubleTextChipField';
import { ChipDisplay } from '../content-display/components/ChipDisplay';

export const DoubleTextChipFieldDisplay = () => {
  const { avatarUrl, firstValue, secondValue, entityType, entityId } =
    useDoubleTextChipField();

  const content = [firstValue, secondValue].filter(Boolean).join(' ');

  return (
    <ChipDisplay
      displayName={content}
      avatarUrlValue={avatarUrl}
      entityType={entityType}
      entityId={entityId}
    />
  );
};
