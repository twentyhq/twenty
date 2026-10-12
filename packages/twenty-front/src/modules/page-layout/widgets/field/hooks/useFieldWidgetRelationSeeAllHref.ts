import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { indexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/indexViewIdFromObjectMetadataItemFamilySelector';
import { AppPath, ViewFilterOperand } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

type UseFieldWidgetRelationSeeAllHrefParams = {
  recordId: string;
  relationMetadata: FieldRelationMetadata | null;
};

export const useFieldWidgetRelationSeeAllHref = ({
  recordId,
  relationMetadata,
}: UseFieldWidgetRelationSeeAllHrefParams) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const relationObjectMetadataItem = objectMetadataItems.find(
    (item) =>
      item.nameSingular ===
      relationMetadata?.relationObjectMetadataNameSingular,
  );

  const relationFieldMetadataItem = relationObjectMetadataItem?.fields.find(
    ({ id }) => id === relationMetadata?.relationFieldMetadataId,
  );

  const indexViewId = useAtomFamilySelectorValue(
    indexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: relationObjectMetadataItem?.id ?? '' },
  );

  if (
    !isDefined(relationObjectMetadataItem) ||
    !isDefined(relationFieldMetadataItem)
  ) {
    return { seeAllHref: undefined, relationObjectMetadataItem: undefined };
  }

  const seeAllHref = getAppPath(
    AppPath.RecordIndexPage,
    {
      objectNamePlural: relationObjectMetadataItem.namePlural,
    },
    {
      filter: {
        [relationFieldMetadataItem.name]: {
          [ViewFilterOperand.IS]: {
            selectedRecordIds: [recordId],
          },
        },
      },
      viewId: indexViewId,
    },
  );

  return { seeAllHref, relationObjectMetadataItem };
};
