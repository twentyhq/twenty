import { RecordChip } from '@/object-record/components/RecordChip';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { RecordBoardCardHeaderContainer } from '@/object-record/record-board/record-board-card/components/RecordBoardCardHeaderContainer';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';
import { RecordBoardScopeInternalContext } from '@/object-record/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { isRecordBoardCompactModeActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCompactModeActiveComponentState';
import { RecordBoardFieldDefinition } from '@/object-record/record-board/types/RecordBoardFieldDefinition';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { getFieldButtonIcon } from '@/object-record/record-field/utils/getFieldButtonIcon';
import { isFieldValueEmpty } from '@/object-record/record-field/utils/isFieldValueEmpty';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexOpenRecordInSelector } from '@/object-record/record-index/states/selectors/recordIndexOpenRecordInSelector';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { useRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import styled from '@emotion/styled';
import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import {
  AvatarChipVariant,
  Checkbox,
  CheckboxVariant,
  IconEye,
  IconEyeOff,
  LightIconButton,
} from 'twenty-ui';

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
  isCardExpanded?: boolean;
  setIsCardExpanded?: Dispatch<SetStateAction<boolean>>;
};

export const RecordBoardCardHeader = ({
  isCreating = false,
  onCreateSuccess,
  position,
  identifierFieldDefinition,
  isCardExpanded,
  setIsCardExpanded,
}: RecordBoardCardHeaderProps) => {
  const [newLabelValue, setNewLabelValue] = useState('');

  const columnId = useContext(RecordBoardColumnContext)?.columnId;

  const { handleBlur, handleInputEnter } = useAddNewCard({
    recordPickerComponentInstanceId: `add-new-card-record-picker-column-${columnId}`,
  });

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

  const isIdentifierEmpty = isFieldValueEmpty({
    fieldDefinition: identifierFieldDefinition,
    fieldValue: record?.[identifierFieldDefinition.metadata.fieldName],
  });

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

  const recordIndexOpenRecordIn = useRecoilValue(
    recordIndexOpenRecordInSelector,
  );

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
              recordId,
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
          isDefined(record) && (
            <RecordChip
              objectNameSingular={objectMetadataItem.nameSingular}
              record={record}
              variant={AvatarChipVariant.Transparent}
              maxWidth={150}
              to={
                recordIndexOpenRecordIn === ViewOpenRecordInType.RECORD_PAGE
                  ? indexIdentifierUrl(recordId)
                  : undefined
              }
            />
          )
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
                    setIsCardExpanded?.((prev) => !prev);
                  }}
                />
              </StopPropagationContainer>
            </StyledCompactIconContainer>
          )}
          <StyledCheckboxContainer className="checkbox-container">
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
