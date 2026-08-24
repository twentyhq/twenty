import { FieldMetadataChip } from '@/ai/components/FieldMetadataChip';
import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';

type LegacyFieldMetadataLinkByIdProps = {
  fieldMetadataItemId: string;
  displayName: string;
};

export const LegacyFieldMetadataLinkById = ({
  fieldMetadataItemId,
  displayName,
}: LegacyFieldMetadataLinkByIdProps) => {
  const { foundFieldMetadataItem, foundObjectMetadataItem } =
    useAtomFamilySelectorValue(fieldMetadataItemByIdSelector, {
      fieldMetadataItemId,
    });

  if (
    !isDefined(foundFieldMetadataItem) ||
    !isDefined(foundObjectMetadataItem)
  ) {
    return <span>{displayName}</span>;
  }

  return (
    <FieldMetadataChip
      displayName={displayName}
      objectMetadataItem={foundObjectMetadataItem}
      fieldMetadataItem={foundFieldMetadataItem}
    />
  );
};
