import { useChipField } from '../../hooks/useChipField';
import { ChipDisplay } from '../content-display/components/ChipDisplay';

export const ChipFieldDisplay = () => {
  const { avatarFieldValue, contentFieldValue, entityId } = useChipField();

  return (
    <ChipDisplay
      displayName={contentFieldValue}
      avatarUrlValue={avatarFieldValue}
      entityId={entityId}
    />
  );
};
