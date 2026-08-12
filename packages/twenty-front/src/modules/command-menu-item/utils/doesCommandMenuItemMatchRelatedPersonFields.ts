import { getRelatedPersonFieldMetadataItems } from '@/activities/emails/related-people/utils/getRelatedPersonFieldMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import {
  EngineComponentKey,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

// This command menu item is deliberately not bound to an object server-side:
// it applies to any object that reaches a person in one hop, which is only
// knowable from the workspace's own field metadata.
export const doesCommandMenuItemMatchRelatedPersonFields =
  (objectMetadataItem: EnrichedObjectMetadataItem | undefined) =>
  (item: CommandMenuItemFieldsFragment) => {
    if (
      item.engineComponentKey !==
      EngineComponentKey.COMPOSE_EMAIL_TO_RELATED_PEOPLE
    ) {
      return true;
    }

    if (!isDefined(objectMetadataItem)) {
      return false;
    }

    return getRelatedPersonFieldMetadataItems(objectMetadataItem).length > 0;
  };
