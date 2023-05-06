import { ChangeEvent, ComponentType, useState } from 'react';
import EditableCellWrapper from './EditableCellWrapper';
import styled from '@emotion/styled';
import { useSearch } from '../../../services/search/search';
import { FilterType } from '../table-header/interface';
import { People_Bool_Exp } from '../../../generated/graphql';

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
`;

export type EditableRelationProps<RelationType, ChipComponentPropsType> = {
  relation: RelationType;
  searchPlaceholder: string;
  searchFilter: FilterType<People_Bool_Exp>;
  changeHandler: (relation: RelationType) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  ChipComponent: ComponentType<ChipComponentPropsType>;
  chipComponentPropsMapper: (
    relation: RelationType,
  ) => ChipComponentPropsType & JSX.IntrinsicAttributes;
};

function EditableRelation<RelationType, ChipComponentPropsType>({
  relation,
  searchPlaceholder,
  searchFilter,
  changeHandler,
  editModeHorizontalAlign,
  ChipComponent,
  chipComponentPropsMapper,
}: EditableRelationProps<RelationType, ChipComponentPropsType>) {
  const [selectedRelation, setSelectedRelation] = useState(relation);
  const [isEditMode, setIsEditMode] = useState(false);

  const [filterSearchResults, setSearchInput, setFilterSearch] = useSearch();

  return (
    <EditableCellWrapper
      editModeHorizontalAlign={editModeHorizontalAlign}
      isEditMode={isEditMode}
      onOutsideClick={() => setIsEditMode(false)}
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
                setFilterSearch(searchFilter);
                setSearchInput(event.target.value);
              }}
            />
          </StyledEditModeSearchContainer>
          <StyledEditModeResults>
            {filterSearchResults.results &&
              filterSearchResults.results.map((result) => (
                <StyledEditModeResultItem
                  key={result.value.id}
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
