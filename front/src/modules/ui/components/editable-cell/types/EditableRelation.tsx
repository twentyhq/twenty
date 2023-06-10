import { ChangeEvent, ComponentType, useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { SearchConfigType } from '@/search/interfaces/interface';
import { useSearch } from '@/search/services/search';
import { textInputStyle } from '@/ui/layout/styles/themes';
import { isSomeInputInEditModeState } from '@/ui/tables/states/isSomeInputInEditModeState';
import { AnyEntity } from '@/utils/interfaces/generic.interface';
import { isDefined } from '@/utils/type-guards/isDefined';
import { isNonEmptyString } from '@/utils/type-guards/isNonEmptyString';

import { EditableCell } from '../EditableCell';
import { HoverableMenuItem } from '../HoverableMenuItem';

import { EditableRelationCreateButton } from './EditableRelationCreateButton';

const StyledEditModeContainer = styled.div`
  width: 200px;
`;

const StyledEditModeSelectedContainer = styled.div`
  height: 31px;
  display: flex;
  align-items: center;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(1)};
`;

const StyledEditModeSearchContainer = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  border-top: 1px solid ${(props) => props.theme.primaryBorder};
  padding-left: ${(props) => props.theme.spacing(1)};
  padding-right: ${(props) => props.theme.spacing(1)};
`;

const StyledEditModeCreateButtonContainer = styled.div`
  height: 36px;
  display: flex;
  align-items: center;
  border-top: 1px solid ${(props) => props.theme.primaryBorder};
  padding: ${(props) => props.theme.spacing(1)};
  color: ${(props) => props.theme.text60};
`;

const StyledEditModeSearchInput = styled.input`
  width: 100%;

  ${textInputStyle}
`;

const StyledEditModeResults = styled.div`
  border-top: 1px solid ${(props) => props.theme.primaryBorder};
  padding-left: ${(props) => props.theme.spacing(1)};
  padding-right: ${(props) => props.theme.spacing(1)};
`;

const StyledEditModeResultItem = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
`;

const StyledCreateButtonIcon = styled.div`
  color: ${(props) => props.theme.text100};
  align-self: center;
  padding-top: 4px;
`;

const StyledCreateButtonText = styled.div`
  color: ${(props) => props.theme.text60};
`;

export type EditableRelationProps<
  RelationType extends AnyEntity,
  ChipComponentPropsType,
> = {
  relation?: RelationType | null;
  searchPlaceholder: string;
  searchConfig: SearchConfigType<RelationType>;
  onChange: (relation: RelationType) => void;
  onChangeSearchInput?: (searchInput: string) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  ChipComponent: ComponentType<ChipComponentPropsType>;
  chipComponentPropsMapper: (
    relation: RelationType,
  ) => ChipComponentPropsType & JSX.IntrinsicAttributes;
  // TODO: refactor, newRelationName is too hard coded.
  onCreate?: (newRelationName: string) => void;
};

// TODO: split this component
export function EditableRelation<
  RelationType extends AnyEntity,
  ChipComponentPropsType,
>({
  relation,
  searchPlaceholder,
  searchConfig,
  onChange,
  onChangeSearchInput,
  editModeHorizontalAlign,
  ChipComponent,
  chipComponentPropsMapper,
  onCreate,
}: EditableRelationProps<RelationType, ChipComponentPropsType>) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [, setIsSomeInputInEditMode] = useRecoilState(
    isSomeInputInEditModeState,
  );

  // TODO: Tie this to a react context
  const [filterSearchResults, setSearchInput, setFilterSearch, searchInput] =
    useSearch<RelationType>();

  useEffect(() => {
    if (isDefined(onChangeSearchInput)) {
      onChangeSearchInput(searchInput);
    }
  }, [onChangeSearchInput, searchInput]);

  const canCreate = isDefined(onCreate);

  const createButtonIsVisible =
    canCreate && isEditMode && isNonEmptyString(searchInput);

  function handleCreateNewRelationButtonClick() {
    onCreate?.(searchInput);
    closeEditMode();
  }

  function closeEditMode() {
    setIsEditMode(false);
    setIsSomeInputInEditMode(false);
  }

  return (
    <>
      <EditableCell
        editModeHorizontalAlign={editModeHorizontalAlign}
        isEditMode={isEditMode}
        onOutsideClick={() => setIsEditMode(false)}
        onInsideClick={() => {
          if (!isEditMode) {
            setIsEditMode(true);
          }
        }}
        tabIndex={0}
        editModeContent={
          <StyledEditModeContainer>
            <StyledEditModeSelectedContainer>
              {relation ? (
                <ChipComponent {...chipComponentPropsMapper(relation)} />
              ) : (
                <></>
              )}
            </StyledEditModeSelectedContainer>
            <StyledEditModeSearchContainer>
              <StyledEditModeSearchInput
                autoFocus
                placeholder={searchPlaceholder}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setFilterSearch(searchConfig);
                  setSearchInput(event.target.value);
                }}
              />
            </StyledEditModeSearchContainer>
            {createButtonIsVisible && (
              <StyledEditModeCreateButtonContainer>
                <HoverableMenuItem>
                  <EditableRelationCreateButton
                    onClick={handleCreateNewRelationButtonClick}
                  >
                    <StyledCreateButtonIcon>
                      <FaPlus />
                    </StyledCreateButtonIcon>
                    <StyledCreateButtonText>Create new</StyledCreateButtonText>
                  </EditableRelationCreateButton>
                </HoverableMenuItem>
              </StyledEditModeCreateButtonContainer>
            )}
            <StyledEditModeResults>
              {filterSearchResults.results &&
                filterSearchResults.results.map((result, index) => (
                  <StyledEditModeResultItem
                    key={index}
                    onClick={() => {
                      onChange(result.value);
                      closeEditMode();
                    }}
                  >
                    <HoverableMenuItem>
                      <ChipComponent
                        {...chipComponentPropsMapper(result.value)}
                      />
                    </HoverableMenuItem>
                  </StyledEditModeResultItem>
                ))}
            </StyledEditModeResults>
          </StyledEditModeContainer>
        }
        nonEditModeContent={
          <>
            {relation ? (
              <ChipComponent {...chipComponentPropsMapper(relation)} />
            ) : (
              <></>
            )}
          </>
        }
      />
    </>
  );
}
