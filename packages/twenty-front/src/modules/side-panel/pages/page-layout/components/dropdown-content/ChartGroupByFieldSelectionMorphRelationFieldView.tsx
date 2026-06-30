import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ChartGroupByFieldSelectionTargetObjectFieldsView } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionTargetObjectFieldsView';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';
import { RelationType } from '~/generated-metadata/graphql';

type MorphRelationTarget = {
  perTargetFieldId: string;
  targetObjectNameSingular: string;
  label: string;
  icon?: string | null;
};

type ChartGroupByFieldSelectionMorphRelationFieldViewProps = {
  morphField: FieldMetadataItem;
  currentFieldMetadataId: string | undefined;
  currentSubFieldName: string | undefined;
  onBack: () => void;
  onSelectTargetSubField: (params: {
    perTargetFieldId: string;
    subFieldName: string;
  }) => void;
};

export const ChartGroupByFieldSelectionMorphRelationFieldView = ({
  morphField,
  currentFieldMetadataId,
  currentSubFieldName,
  onBack,
  onSelectTargetSubField,
}: ChartGroupByFieldSelectionMorphRelationFieldViewProps) => {
  const { getIcon } = useIcons();

  const { objectMetadataItems } = useObjectMetadataItems();

  const [selectedTarget, setSelectedTarget] =
    useState<MorphRelationTarget | null>(null);

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );
  const availableTargets = useMemo<MorphRelationTarget[]>(() => {
    return (morphField.morphRelations ?? [])
      .filter(
        (morphRelation) => morphRelation.type === RelationType.MANY_TO_ONE,
      )
      .map((morphRelation) => {
        const targetObjectMetadataItem = objectMetadataItems.find(
          (item) =>
            item.nameSingular ===
            morphRelation.targetObjectMetadata.nameSingular,
        );

        return {
          perTargetFieldId: morphRelation.sourceFieldMetadata.id,
          targetObjectNameSingular:
            morphRelation.targetObjectMetadata.nameSingular,
          label:
            targetObjectMetadataItem?.labelSingular ??
            morphRelation.targetObjectMetadata.nameSingular,
          icon: targetObjectMetadataItem?.icon,
        };
      });
  }, [morphField.morphRelations, objectMetadataItems]);

  if (isDefined(selectedTarget)) {
    return (
      <ChartGroupByFieldSelectionTargetObjectFieldsView
        targetObjectNameSingular={selectedTarget.targetObjectNameSingular}
        headerLabel={`${morphField.label} · ${selectedTarget.label}`}
        currentSubFieldName={
          selectedTarget.perTargetFieldId === currentFieldMetadataId
            ? currentSubFieldName
            : undefined
        }
        onBack={() => setSelectedTarget(null)}
        onSelectSubField={(subFieldName) =>
          onSelectTargetSubField({
            perTargetFieldId: selectedTarget.perTargetFieldId,
            subFieldName,
          })
        }
      />
    );
  }

  return (
    <>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={onBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {morphField.label}
      </DropdownMenuHeader>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        {availableTargets.length === 0 ? (
          <MenuItem text={t`No targets available`} />
        ) : (
          <SelectableList
            selectableListInstanceId={dropdownId}
            focusId={dropdownId}
            selectableItemIdArray={availableTargets.map(
              (target) => target.perTargetFieldId,
            )}
          >
            {availableTargets.map((target) => (
              <SelectableListItem
                key={target.perTargetFieldId}
                itemId={target.perTargetFieldId}
                onEnter={() => {
                  setSelectedTarget(target);
                }}
              >
                <MenuItem
                  text={target.label}
                  focused={selectedItemId === target.perTargetFieldId}
                  LeftIcon={
                    isDefined(target.icon) ? getIcon(target.icon) : undefined
                  }
                  hasSubMenu
                  onClick={() => {
                    setSelectedTarget(target);
                  }}
                />
              </SelectableListItem>
            ))}
          </SelectableList>
        )}
      </DropdownMenuItemsContainer>
    </>
  );
};
