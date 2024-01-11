import { useContext, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { AddPersonToCompany } from '@/companies/components/AddPersonToCompany';
import { companyProgressesFamilyState } from '@/companies/states/companyProgressesFamilyState';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { FieldDefinition } from '@/object-record/field/types/FieldDefinition';
import { FieldRelationMetadata } from '@/object-record/field/types/FieldMetadata';
import { BoardCardIdContext } from '@/object-record/record-board/contexts/BoardCardIdContext';
import { SingleEntitySelect } from '@/object-record/relation-picker/components/SingleEntitySelect';
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { IconForbid } from '@/ui/display/icon';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { isDefined } from '~/utils/isDefined';

export type RelationPickerProps = {
  recordId?: string;
  onSubmit: (selectedEntity: EntityForSelect | null) => void;
  onCancel?: () => void;
  width?: number;
  excludeRecordIds?: string[];
  initialSearchFilter?: string | null;
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
};

export const RelationPicker = ({
  recordId,
  onSubmit,
  onCancel,
  excludeRecordIds,
  width,
  initialSearchFilter,
  fieldDefinition,
}: RelationPickerProps) => {
  const {
    relationPickerSearchFilter,
    setRelationPickerSearchFilter,
    identifiersMapper,
    searchQuery,
  } = useRelationPicker();

  const [showAddNewDropdown, setShowAddNewDropdown] = useState(false);

  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  useEffect(() => {
    setRelationPickerSearchFilter(initialSearchFilter ?? '');
  }, [initialSearchFilter, setRelationPickerSearchFilter]);

  const boardCardId = useContext(BoardCardIdContext);
  const weAreInOpportunitiesPageCard = isDefined(boardCardId);

  const [companyProgress] = useRecoilState(
    companyProgressesFamilyState(boardCardId ?? ''),
  );

  const { company } = companyProgress ?? {};
  const companyId = company?.id;

  const { objectNameSingular: relationObjectNameSingular } =
    useObjectNameSingularFromPlural({
      objectNamePlural:
        fieldDefinition.metadata.relationObjectMetadataNamePlural,
    });

  const entities = useFilteredSearchEntityQuery({
    filters: [
      {
        fieldNames:
          searchQuery?.computeFilterFields?.(
            fieldDefinition.metadata.relationObjectMetadataNameSingular,
          ) ?? [],
        filter: relationPickerSearchFilter,
      },
    ],
    orderByField: 'createdAt',
    mappingFunction: (record: any) =>
      identifiersMapper?.(
        record,
        fieldDefinition.metadata.relationObjectMetadataNameSingular,
      ),
    selectedIds: recordId ? [recordId] : [],
    excludeEntityIds: excludeRecordIds,
    objectNameSingular: relationObjectNameSingular,
  });

  const handleEntitySelected = (selectedEntity: any | null | undefined) =>
    onSubmit(selectedEntity ?? null);

  const entitiesToSelect = entities.entitiesToSelect.filter((entity) =>
    weAreInOpportunitiesPageCard ? entity.record.companyId === companyId : true,
  );

  const weAreAddingNewPerson =
    weAreInOpportunitiesPageCard && showAddNewDropdown && companyId;

  return (
    <>
      {!weAreAddingNewPerson ? (
        <SingleEntitySelect
          EmptyIcon={IconForbid}
          emptyLabel={'No ' + fieldDefinition.label}
          entitiesToSelect={entitiesToSelect}
          loading={entities.loading}
          onCancel={onCancel}
          onEntitySelected={handleEntitySelected}
          selectedEntity={entities.selectedEntities[0]}
          width={width}
          onCreate={() => {
            if (weAreInOpportunitiesPageCard) {
              setShowAddNewDropdown(true);
              setHotkeyScopeAndMemorizePreviousScope(
                RelationPickerHotkeyScope.AddNew,
              );
            }
          }}
        />
      ) : (
        <AddPersonToCompany
          companyId={companyId}
          onEntitySelected={handleEntitySelected}
          closeDropdown={() => setShowAddNewDropdown(false)}
        />
      )}
    </>
  );
};
