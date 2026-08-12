import { useComposeEmailToRelatedPeople } from '@/activities/emails/related-people/hooks/useComposeEmailToRelatedPeople';
import { useRelatedPeopleContextStoreTarget } from '@/activities/emails/related-people/hooks/useRelatedPeopleContextStoreTarget';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useState } from 'react';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconUser } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

type RelatedPersonRelationListProps = {
  selectableListInstanceId: string;
  // Called once the composer has been opened. Omitted when the list already
  // lives in the surface the composer replaces.
  onComposed?: () => void;
  // Omitted when the list renders inside the record index, where the ambient
  // context store instance is already the right one.
  contextStoreInstanceId?: string;
};

type RelatedPersonRelationListContentProps = RelatedPersonRelationListProps & {
  objectMetadataItem: EnrichedObjectMetadataItem;
  graphqlFilter: RecordGqlOperationFilter | undefined;
};

const RelatedPersonRelationListContent = ({
  selectableListInstanceId,
  onComposed,
  objectMetadataItem,
  graphqlFilter,
}: RelatedPersonRelationListContentProps) => {
  const [isComposing, setIsComposing] = useState(false);

  const { relatedPersonFieldMetadataItems, composeEmailToRelatedPeople } =
    useComposeEmailToRelatedPeople({ objectMetadataItem, graphqlFilter });

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    selectableListInstanceId,
  );

  // Resolving the recipients is a round trip, so the list stays mounted until
  // it finishes rather than tearing itself down mid-flight.
  const handleSelect = async (fieldMetadataItemId: string) => {
    if (isComposing) {
      return;
    }

    const relatedPersonFieldMetadataItem = relatedPersonFieldMetadataItems.find(
      (fieldMetadataItem) => fieldMetadataItem.id === fieldMetadataItemId,
    );

    if (!isDefined(relatedPersonFieldMetadataItem)) {
      return;
    }

    setIsComposing(true);

    await composeEmailToRelatedPeople(relatedPersonFieldMetadataItem);

    onComposed?.();
  };

  return (
    <SelectableList
      focusId={selectableListInstanceId}
      selectableListInstanceId={selectableListInstanceId}
      selectableItemIdArray={relatedPersonFieldMetadataItems.map(
        (fieldMetadataItem) => fieldMetadataItem.id,
      )}
    >
      {relatedPersonFieldMetadataItems.map((fieldMetadataItem) => (
        <SelectableListItem
          key={fieldMetadataItem.id}
          itemId={fieldMetadataItem.id}
          onEnter={() => handleSelect(fieldMetadataItem.id)}
        >
          <MenuItem
            LeftIcon={IconUser}
            text={fieldMetadataItem.label}
            focused={selectedItemId === fieldMetadataItem.id}
            onClick={() => handleSelect(fieldMetadataItem.id)}
          />
        </SelectableListItem>
      ))}
    </SelectableList>
  );
};

export const RelatedPersonRelationList = ({
  selectableListInstanceId,
  onComposed,
  contextStoreInstanceId,
}: RelatedPersonRelationListProps) => {
  const { objectMetadataItem, graphqlFilter } =
    useRelatedPeopleContextStoreTarget(contextStoreInstanceId);

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  return (
    <RelatedPersonRelationListContent
      selectableListInstanceId={selectableListInstanceId}
      onComposed={onComposed}
      objectMetadataItem={objectMetadataItem}
      graphqlFilter={graphqlFilter ?? undefined}
    />
  );
};
