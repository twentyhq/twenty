import { ChangeEvent, ComponentType, useState } from 'react';
import EditableCellWrapper from './EditableCellWrapper';
import styled from '@emotion/styled';
import { useSearch } from '../../services/api/search/search';
import { SearchConfigType } from '../../interfaces/search/interface';
import { AnyEntity } from '../../interfaces/entities/generic.interface';
import { EditableRelationCreateButton } from './EditableRelationCreateButton';
import { isNonEmptyArray } from '../../modules/utils/type-guards/isNonEmptyArray';
import { isNonEmptyString } from '../../modules/utils/type-guards/isNonEmptyString';
import { EditableCellWrapperWithShortcut } from './EditableCellWrapperWithShortcut';

const StyledEditModeContainer = styled.div`
  width: 200px;
  margin-left: calc(-1 * ${(props) => props.theme.spacing(2)});
  margin-right: calc(-1 * ${(props) => props.theme.spacing(2)});
`;

const StyledEditModeSelectedContainer = styled.div`
  height: 31px;
  display: flex;
  align-items: center;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};
`;

const StyledEditModeSearchContainer = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  border-top: 1px solid ${(props) => props.theme.primaryBorder};
`;

const StyledEditModeCreateButtonContainer = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  border-top: 1px solid ${(props) => props.theme.primaryBorder};
`;

const StyledEditModeSearchInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};

  &::placeholder {
    font-weight: 'bold';
    color: ${(props) => props.theme.text20};
  }
`;

const StyledEditModeResults = styled.div`
  border-top: 1px solid ${(props) => props.theme.primaryBorder};
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};
`;

const StyledEditModeResultItem = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
`;

export type EditableRelationProps<
  RelationType extends AnyEntity,
  ChipComponentPropsType,
> = {
  relation?: RelationType | null;
  searchPlaceholder: string;
  searchConfig: SearchConfigType<RelationType>;
  changeHandler: (relation: RelationType) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  ChipComponent: ComponentType<ChipComponentPropsType>;
  chipComponentPropsMapper: (
    relation: RelationType,
  ) => ChipComponentPropsType & JSX.IntrinsicAttributes;
};

function EditableRelation<
  RelationType extends AnyEntity,
  ChipComponentPropsType,
>({
  relation,
  searchPlaceholder,
  searchConfig,
  changeHandler,
  editModeHorizontalAlign,
  ChipComponent,
  chipComponentPropsMapper,
}: EditableRelationProps<RelationType, ChipComponentPropsType>) {
  const [selectedRelation, setSelectedRelation] = useState(relation);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreationMode, setIsCreationMode] = useState(false);

  const [filterSearchResults, setSearchInput, setFilterSearch, searchInput] =
    useSearch<RelationType>();

  const isVisibleCreateNewRelationButton =
    isEditMode && isNonEmptyString(searchInput);

  function handleCreateNewRelationButtonClick() {
    setIsCreationMode(true);
    setIsEditMode(false);
  }

  return (
    <EditableCellWrapperWithShortcut
      editModeHorizontalAlign={editModeHorizontalAlign}
      isEditMode={isEditMode}
      onCancel={() => setIsEditMode(false)}
      onValidate={() => setIsEditMode(false)}
      onInsideClick={() => {
        if (!isEditMode) {
          setIsEditMode(true);
        }
      }}
      editModeContent={
        <StyledEditModeContainer>
          <StyledEditModeSelectedContainer>
            {selectedRelation ? (
              <ChipComponent {...chipComponentPropsMapper(selectedRelation)} />
            ) : (
              <></>
            )}
          </StyledEditModeSelectedContainer>
          <StyledEditModeSearchContainer>
            <StyledEditModeSearchInput
              placeholder={searchPlaceholder}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setFilterSearch(searchConfig);
                setSearchInput(event.target.value);
              }}
            />
          </StyledEditModeSearchContainer>
          {isVisibleCreateNewRelationButton && (
            <StyledEditModeCreateButtonContainer>
              <EditableRelationCreateButton
                onClick={handleCreateNewRelationButtonClick}
              >
                + Create new
              </EditableRelationCreateButton>
            </StyledEditModeCreateButtonContainer>
          )}
          <StyledEditModeResults>
            {filterSearchResults.results &&
              filterSearchResults.results.map((result, index) => (
                <StyledEditModeResultItem
                  key={index}
                  onClick={() => {
                    setSelectedRelation(result.value);
                    changeHandler(result.value);
                    setIsEditMode(false);
                  }}
                >
                  <ChipComponent {...chipComponentPropsMapper(result.value)} />
                </StyledEditModeResultItem>
              ))}
          </StyledEditModeResults>
        </StyledEditModeContainer>
      }
      nonEditModeContent={
        <div>
          {selectedRelation ? (
            <ChipComponent {...chipComponentPropsMapper(selectedRelation)} />
          ) : (
            <></>
          )}
        </div>
      }
    />
  );
}

export default EditableRelation;
