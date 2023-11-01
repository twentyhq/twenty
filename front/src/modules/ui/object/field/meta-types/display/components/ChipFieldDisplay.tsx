import { useChipField } from '../../hooks/useChipField';
import { ChipDisplay } from '../content-display/components/ChipDisplay';

export const ChipFieldDisplay = () => {
  const { avatarFieldValue, contentFieldValue, entityType, entityId } =
    useChipField();

  return (
    <ChipDisplay
      displayName={contentFieldValue}
      avatarUrlValue={avatarFieldValue}
      entityType={entityType}
      entityId={entityId}
    />
  );
};
