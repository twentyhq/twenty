import { EMPTY_SELECTED_RECORDS } from '@/command-menu-item/constants/EmptySelectedRecords';
import { useConditionalDisplayCurrentUserContext } from '@/conditional-display/hooks/useConditionalDisplayCurrentUserContext';
import { evaluateConditionalDisplay } from '@/conditional-display/utils/evaluateConditionalDisplay';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCallback } from 'react';
import { type ObjectRecord } from 'twenty-shared/types';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export const useDoesCommandMenuItemMatchConditionalDisplay = (
  selectedRecords: ObjectRecord[] = EMPTY_SELECTED_RECORDS,
) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const { currentRoleId, currentWorkspaceMemberId } =
    useConditionalDisplayCurrentUserContext();

  const doesCommandMenuItemMatchConditionalDisplay = useCallback(
    (item: CommandMenuItemFieldsFragment) =>
      evaluateConditionalDisplay({
        conditionalDisplay: item.conditionalDisplay,
        context: { currentRoleId, currentWorkspaceMemberId },
        records: selectedRecords,
        objectMetadataItem: objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.id === item.availabilityObjectMetadataId,
        ),
        objectMetadataItems,
      }),
    [
      currentRoleId,
      currentWorkspaceMemberId,
      selectedRecords,
      objectMetadataItems,
    ],
  );

  return { doesCommandMenuItemMatchConditionalDisplay };
};
