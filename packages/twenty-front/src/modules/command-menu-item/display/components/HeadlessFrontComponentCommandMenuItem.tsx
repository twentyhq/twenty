import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useMountHeadlessFrontComponent } from '@/front-components/hooks/useMountHeadlessFrontComponent';
import { isHeadlessFrontComponentMountedFamilySelector } from '@/front-components/selectors/isHeadlessFrontComponentMountedFamilySelector';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { HeadlessCommandMenuItem } from './HeadlessCommandMenuItem';

// TODO: Some code is duplicated in this component and FrontComponentCommandMenuItem
// This will be refactored because the logic will differ between headless and non-headless front components.
export const HeadlessFrontComponentCommandMenuItem = ({
  frontComponentId,
  commandMenuItemId,
}: {
  frontComponentId: string;
  commandMenuItemId: string;
}) => {
  const mountHeadlessFrontComponent = useMountHeadlessFrontComponent();

  const isMounted = useAtomFamilySelectorValue(
    isHeadlessFrontComponentMountedFamilySelector,
    frontComponentId,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const currentObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id === contextStoreCurrentObjectMetadataItemId,
  );

  const selectedRecordIds =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds
      : [];

  const recordId =
    selectedRecordIds.length === 1 ? selectedRecordIds[0] : undefined;

  const objectNameSingular = currentObjectMetadataItem?.nameSingular;

  const handleClick = () => {
    mountHeadlessFrontComponent(frontComponentId, {
      commandMenuItemId,
      recordId,
      objectNameSingular,
    });
  };

  return (
    <HeadlessCommandMenuItem
      isMounted={isMounted}
      commandMenuItemId={commandMenuItemId}
      onClick={handleClick}
    />
  );
};
