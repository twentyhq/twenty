// SOURCING: twentyhq/twenty RecordListRow (PR #23829) — fork-local RELATIONS row
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordChip } from '@/object-record/components/RecordChip';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { RecordListRowField } from '@/object-record/record-list/components/RecordListRowField';
import { RecordRelationsAlsoLinkedFromCell } from '@/object-record/record-relations/components/RecordRelationsAlsoLinkedFromCell';
import { RecordRelationsRelationCell } from '@/object-record/record-relations/components/RecordRelationsRelationCell';
import { useRecordRelationsContextOrThrow } from '@/object-record/record-relations/contexts/RecordRelationsContext';
import { extractConnectedRecords } from '@/object-record/record-relations/utils/extractConnectedRecords';
import { type AlsoLinkedFromHit } from '@/object-record/record-relations/utils/computeAlsoLinkedFrom';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronRight } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRow = styled.tr`
  cursor: pointer;

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledCell = styled.td`
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  vertical-align: middle;
`;

const StyledExpandButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: inline-flex;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledSubRow = styled.tr`
  background: ${themeCssVariables.background.transparent.light};
`;

const StyledSubRowLabel = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[6]};
`;

const StyledObjectName = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type RecordRelationsRowProps = {
  recordId: string;
  relationFields: FieldMetadataItem[];
  scalarRecordFields: RecordField[];
  alsoLinkedFromHits: AlsoLinkedFromHit[];
  recordsById: Map<string, ObjectRecord>;
  expanded: boolean;
  onToggleExpanded: () => void;
};

export const RecordRelationsRow = ({
  recordId,
  relationFields,
  scalarRecordFields,
  alsoLinkedFromHits,
  recordsById,
  expanded,
  onToggleExpanded,
}: RecordRelationsRowProps) => {
  const { objectNameSingular } = useRecordRelationsContextOrThrow();
  const {
    labelIdentifierFieldMetadataItem,
    fieldDefinitionByFieldMetadataItemId,
  } = useRecordIndexContextOrThrow();
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);
  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  if (!isDefined(recordStore)) {
    return null;
  }

  const connectedByField = relationFields.flatMap((field) =>
    extractConnectedRecords(recordStore[field.name]).map((connected) => ({
      field,
      connected,
    })),
  );

  const columnCount = 2 + relationFields.length + scalarRecordFields.length + 1;

  return (
    <>
      <StyledRow
        onClick={() =>
          openRecordFromIndexView({ recordId })
        }
      >
        <StyledCell>
          <StyledExpandButton
            type="button"
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse row' : 'Expand row'}
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpanded();
            }}
          >
            {expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          </StyledExpandButton>
        </StyledCell>
        <StyledCell>
          <RecordChip
            objectNameSingular={objectNameSingular}
            record={recordStore}
          />
        </StyledCell>
        {relationFields.map((field) => (
          <StyledCell key={field.id}>
            <RecordRelationsRelationCell field={field} record={recordStore} />
          </StyledCell>
        ))}
        {scalarRecordFields.map((recordField) => {
          const fieldDefinition =
            fieldDefinitionByFieldMetadataItemId[
              recordField.fieldMetadataItemId
            ];

          if (!isDefined(fieldDefinition)) {
            return <StyledCell key={recordField.id} />;
          }

          return (
            <StyledCell key={recordField.id}>
              <RecordListRowField
                recordId={recordId}
                recordField={recordField}
                fieldDefinition={fieldDefinition}
              />
            </StyledCell>
          );
        })}
        <StyledCell>
          <RecordRelationsAlsoLinkedFromCell
            hits={alsoLinkedFromHits}
            objectNameSingular={objectNameSingular}
            recordsById={recordsById}
          />
        </StyledCell>
      </StyledRow>
      {expanded &&
        connectedByField.map(({ field, connected }) => {
          const objectName =
            field.relation?.targetObjectMetadata.nameSingular ??
            labelIdentifierFieldMetadataItem?.name;

          if (!isDefined(objectName)) {
            return null;
          }

          return (
            <StyledSubRow key={`${recordId}-${field.id}-${connected.id}`}>
              <StyledCell colSpan={columnCount}>
                <StyledSubRowLabel>
                  <RecordChip
                    objectNameSingular={objectName}
                    record={connected}
                  />
                  <StyledObjectName>{objectName}</StyledObjectName>
                </StyledSubRowLabel>
              </StyledCell>
            </StyledSubRow>
          );
        })}
    </>
  );
};
