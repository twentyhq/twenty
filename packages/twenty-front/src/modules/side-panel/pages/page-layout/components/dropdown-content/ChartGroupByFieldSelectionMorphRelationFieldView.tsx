import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ChartGroupByFieldSelectionTargetObjectFieldsView } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionTargetObjectFieldsView';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon';
import { RelationType } from '~/generated-metadata/graphql';

type ChartGroupByFieldSelectionMorphRelationFieldViewProps = {
  pageId: string;
  morphField: FieldMetadataItem;
};

export const ChartGroupByFieldSelectionMorphRelationFieldView = ({
  pageId,
  morphField,
}: ChartGroupByFieldSelectionMorphRelationFieldViewProps) => {
  const { getIcon } = useIcons();
  const { objectMetadataItems } = useObjectMetadataItems();
  const availableTargets = useMemo(
    () =>
      (morphField.morphRelations ?? [])
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
        }),
    [morphField.morphRelations, objectMetadataItems],
  );

  return (
    <>
      <Dropdown.Page id={pageId}>
        <Dropdown.Back>{morphField.label}</Dropdown.Back>
        <ChartSettingsDropdownSection>
          {availableTargets.map((target) => (
            <Dropdown.ActionItem
              key={target.perTargetFieldId}
              page={`${pageId}:${target.perTargetFieldId}`}
              startIcon={
                <SelectOptionIcon
                  Icon={
                    isDefined(target.icon) ? getIcon(target.icon) : undefined
                  }
                />
              }
            >
              {target.label}
            </Dropdown.ActionItem>
          ))}
          {!isNonEmptyArray(availableTargets) && (
            <Dropdown.Empty>{t`No targets available`}</Dropdown.Empty>
          )}
        </ChartSettingsDropdownSection>
      </Dropdown.Page>
      {availableTargets.map((target) => (
        <ChartGroupByFieldSelectionTargetObjectFieldsView
          key={target.perTargetFieldId}
          pageId={`${pageId}:${target.perTargetFieldId}`}
          targetObjectNameSingular={target.targetObjectNameSingular}
          headerLabel={`${morphField.label} · ${target.label}`}
          fieldMetadataId={target.perTargetFieldId}
        />
      ))}
    </>
  );
};
