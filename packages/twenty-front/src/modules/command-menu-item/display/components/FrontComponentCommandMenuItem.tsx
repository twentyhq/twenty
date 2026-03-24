import { CommandConfigContext } from '@/command-menu-item/contexts/CommandConfigContext';
import { Command } from '@/command-menu-item/display/components/Command';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useOpenFrontComponentInSidePanel } from '@/side-panel/hooks/useOpenFrontComponentInSidePanel';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const FrontComponentCommandMenuItem = ({
  frontComponentId,
}: {
  frontComponentId: string;
}) => {
  const { openFrontComponentInSidePanel } = useOpenFrontComponentInSidePanel();
  const commandMenuItemConfig = useContext(CommandConfigContext);

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

  const displayLabel =
    typeof commandMenuItemConfig?.label === 'string'
      ? commandMenuItemConfig.label
      : '';

  const Icon = commandMenuItemConfig?.Icon;

  const handleClick = () => {
    if (!isDefined(Icon)) {
      return;
    }

    openFrontComponentInSidePanel({
      frontComponentId,
      pageTitle: displayLabel,
      pageIcon: Icon,
      recordContext:
        isDefined(recordId) && isDefined(objectNameSingular)
          ? { recordId, objectNameSingular }
          : undefined,
    });
  };

  return <Command onClick={handleClick} />;
};
