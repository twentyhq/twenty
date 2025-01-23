import {
  AvatarChipVariant,
  Checkbox,
  CheckboxVariant,
  LightIconButton,
  IconEye,
  IconEyeOff,
} from 'twenty-ui';
import { StopPropagationContainer } from '@/object-record/record-board/utils/StopPropagationContainer';
import { RecordBoardCardHeaderContainer } from '@/object-record/record-board/record-board-card/components/RecordBoardCardHeaderContainer';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import styled from '@emotion/styled';
import { TextInput } from '@/ui/input/components/TextInput';
import { useContext, useState } from 'react';
import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';
import { RecordBoardFieldDefinition } from '@/object-record/record-board/types/RecordBoardFieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getFieldButtonIcon } from '@/object-record/record-field/utils/getFieldButtonIcon';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { useRecoilValue } from 'recoil';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { RecordIdentifierChip } from '@/object-record/record-index/components/RecordIndexRecordChip';
import { useRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyStateV2';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { RecordBoardScopeInternalContext } from '@/object-record/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isRecordBoardCompactModeActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCompactModeActiveComponentState';

const StyledTextInput = styled(TextInput)`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  width: ${({ theme }) => theme.spacing(53)};
`;

const StyledCompactIconContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledCheckboxContainer = styled.div`
  margin-left: auto;
`;

type RecordBoardCardHeaderProps = {
  isCreating?: boolean;
  onCreateSuccess?: () => void;
  position?: 'first' | 'last';
  identifierFieldDefinition: RecordBoardFieldDefinition<FieldMetadata>;
};

export const RecordBoardCardHeader = ({
  isCreating = false,
  onCreateSuccess,
  position,
  identifierFieldDefinition,
}: RecordBoardCardHeaderProps) => {
  const [newLabelValue, setNewLabelValue] = useState('');

  const [isCardExpanded, setIsCardExpanded] = useState(false);

  const { handleBlur, handleInputEnter } = useAddNewCard();

  const { recordId } = useContext(RecordBoardCardContext);

  const { indexIdentifierUrl } = useRecordIndexContextOrThrow();

  const record = useRecoilValue(recordStoreFamilyState(recordId));

  const { updateOneRecord, objectMetadataItem } =
    useContext(RecordBoardContext);

  const recordBoardId = useAvailableScopeIdOrThrow(
    RecordBoardScopeInternalContext,
  );

  const showCompactView = useRecoilComponentValueV2(
    isRecordBoardCompactModeActiveComponentState,
  );

  const isIdentifierEmpty =
    (record?.[identifierFieldDefinition.metadata.fieldName] || '').trim() ===
    '';

  const { checkIfLastUnselectAndCloseDropdown } =
    useRecordBoardSelection(recordBoardId);

  const [isCurrentCardSelected, setIsCurrentCardSelected] =
    useRecoilComponentFamilyStateV2(
      isRecordBoardCardSelectedComponentFamilyState,
      recordId,
    );

  const useUpdateOneRecordHook: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  return (
    <RecordBoardCardHeaderContainer showCompactView={showCompactView}>
      <StopPropagationContainer>
        {isCreating && position !== undefined ? (
          <RecordInlineCellEditMode>
            <StyledTextInput
              autoFocus
              value={newLabelValue}
              onInputEnter={() =>
                handleInputEnter(
                  identifierFieldDefinition.label ?? '',
                  newLabelValue,
                  position,
                  onCreateSuccess,
                )
              }
              onBlur={() =>
                handleBlur(
                  identifierFieldDefinition.label ?? '',
                  newLabelValue,
                  position,
                  onCreateSuccess,
                )
              }
              onChange={(text: string) => setNewLabelValue(text)}
              placeholder={identifierFieldDefinition.label}
            />
          </RecordInlineCellEditMode>
        ) : isIdentifierEmpty ? (
          <FieldContext.Provider
            value={{
              recordId: (record as ObjectRecord).id,
              maxWidth: 156,
              recoilScopeId:
                (isCreating ? 'new' : recordId) +
                identifierFieldDefinition.fieldMetadataId,
              isLabelIdentifier: true,
              fieldDefinition: {
                disableTooltip: false,
                fieldMetadataId: identifierFieldDefinition.fieldMetadataId,
                label: `Set ${identifierFieldDefinition.label}`,
                iconName: identifierFieldDefinition.iconName,
                type: identifierFieldDefinition.type,
                metadata: identifierFieldDefinition.metadata,
                defaultValue: identifierFieldDefinition.defaultValue,
                editButtonIcon: getFieldButtonIcon({
                  metadata: identifierFieldDefinition.metadata,
                  type: identifierFieldDefinition.type,
                }),
              },
              useUpdateRecord: useUpdateOneRecordHook,
              hotkeyScope: InlineCellHotkeyScope.InlineCell,
            }}
          >
            <RecordInlineCell />
          </FieldContext.Provider>
        ) : (
          <RecordIdentifierChip
            objectNameSingular={objectMetadataItem.nameSingular}
            record={record as ObjectRecord}
            variant={AvatarChipVariant.Transparent}
            maxWidth={150}
            to={indexIdentifierUrl(recordId)}
          />
        )}
      </StopPropagationContainer>

      {!isCreating && (
        <>
          {showCompactView && (
            <StyledCompactIconContainer className="compact-icon-container">
              <StopPropagationContainer>
                <LightIconButton
                  Icon={isCardExpanded ? IconEyeOff : IconEye}
                  accent="tertiary"
                  onClick={() => {
                    setIsCardExpanded((prev) => !prev);
                  }}
                />
              </StopPropagationContainer>
            </StyledCompactIconContainer>
          )}
          <StyledCheckboxContainer className="checkbox-container">
            {' '}
            <StopPropagationContainer>
              <Checkbox
                hoverable
                checked={isCurrentCardSelected}
                onChange={() => {
                  setIsCurrentCardSelected(!isCurrentCardSelected);
                  checkIfLastUnselectAndCloseDropdown();
                }}
                variant={CheckboxVariant.Secondary}
              />
            </StopPropagationContainer>
          </StyledCheckboxContainer>
        </>
      )}
    </RecordBoardCardHeaderContainer>
  );
};
