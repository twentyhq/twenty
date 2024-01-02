import { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { StyledInputContainer } from '@/companies/components/AddPersonToCompany';
import { companyProgressesFamilyState } from '@/companies/states/companyProgressesFamilyState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { FieldDefinition } from '@/object-record/field/types/FieldDefinition';
import { FieldDoubleText } from '@/object-record/field/types/FieldDoubleText';
import { FieldRelationMetadata } from '@/object-record/field/types/FieldMetadata';
import { BoardCardIdContext } from '@/object-record/record-board/contexts/BoardCardIdContext';
import { SingleEntitySelect } from '@/object-record/relation-picker/components/SingleEntitySelect';
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { IconForbid } from '@/ui/display/icon';
import { DoubleTextInput } from '@/ui/field/input/components/DoubleTextInput';

export type RelationPickerProps = {
  recordId?: string;
  onSubmit: (newUser: EntityForSelect | null) => void;
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
  const { relationPickerSearchFilter, setRelationPickerSearchFilter } =
    useRelationPicker();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setRelationPickerSearchFilter(initialSearchFilter ?? '');
  }, [initialSearchFilter, setRelationPickerSearchFilter]);

  // TODO: refactor useFilteredSearchEntityQuery
  const { findManyRecordsQuery } = useObjectMetadataItem({
    objectNameSingular:
      fieldDefinition.metadata.relationObjectMetadataNameSingular,
  });

  const handleEscape = () => setShowDropdown(false);

  const boardCardId = useContext(BoardCardIdContext);

  const [companyProgress] = useRecoilState(
    companyProgressesFamilyState(boardCardId ?? ''),
  );

  const { company } = companyProgress ?? {};

  const { createOneRecordMutation } = useObjectMetadataItem({
    objectNameSingular: 'person',
  });

  const [createPerson] = useMutation(createOneRecordMutation);

  const handleCreatePerson = async ({
    firstValue,
    secondValue,
  }: FieldDoubleText) => {
    if (!firstValue && !secondValue) return;
    const newPersonId = v4();

    await createPerson({
      variables: {
        input: {
          companyId: company?.id,
          id: newPersonId,
          name: {
            firstName: firstValue,
            lastName: secondValue,
          },
        },
      },
      refetchQueries: [getOperationName(findManyRecordsQuery) ?? ''],
    });
    setShowDropdown(false);
  };

  const useFindManyQuery = (options: any) =>
    useQuery(findManyRecordsQuery, options);

  const { identifiersMapper, searchQuery } = useRelationPicker();

  const { objectNameSingular: relationObjectNameSingular } =
    useObjectNameSingularFromPlural({
      objectNamePlural:
        fieldDefinition.metadata.relationObjectMetadataNamePlural,
    });

  const records = useFilteredSearchEntityQuery({
    queryHook: useFindManyQuery,
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

  const filteredEntitiesToSelect = records.entitiesToSelect.filter((entity) => {
    return entity.record.companyId === company?.id;
  });

  const handleEntitySelected = async (selectedUser: any | null | undefined) => {
    onSubmit(selectedUser ?? null);
  };

  const [initialEntities, setInitialEntities] = useState<EntityForSelect[]>([]);

  useEffect(() => {
    if (records.entitiesToSelect?.length > 0 && initialEntities.length === 0) {
      setInitialEntities(records.entitiesToSelect);
    }
  }, [initialEntities.length, records.entitiesToSelect]);

  return (
    <>
      <SingleEntitySelect
        EmptyIcon={IconForbid}
        emptyLabel={'No ' + fieldDefinition.label}
        entitiesToSelect={filteredEntitiesToSelect}
        loading={records.loading}
        onCancel={onCancel}
        onEntitySelected={handleEntitySelected}
        selectedEntity={records.selectedEntities[0]}
        width={width}
        onCreate={() => setShowDropdown(true)}
        initialEntities={initialEntities}
        currentCompany={company?.id}
      />
      {showDropdown && (
        <StyledInputContainer>
          <DoubleTextInput
            firstValue=""
            secondValue=""
            firstValuePlaceholder="First Name"
            secondValuePlaceholder="Last Name"
            onClickOutside={handleEscape}
            onEnter={handleCreatePerson}
            onEscape={handleEscape}
            hotkeyScope={RelationPickerHotkeyScope.RelationPicker}
          />
        </StyledInputContainer>
      )}
    </>
  );
};
