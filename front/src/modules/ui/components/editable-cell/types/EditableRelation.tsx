import { ChangeEvent, ComponentType, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { SearchConfigType } from '@/search/interfaces/interface';
import { useSearch } from '@/search/services/search';
import { IconPlus } from '@/ui/icons/index';
import { textInputStyle } from '@/ui/layout/styles/themes';
import { isSomeInputInEditModeState } from '@/ui/tables/states/isSomeInputInEditModeState';
import { isDefined } from '@/utils/type-guards/isDefined';
import { isNonEmptyString } from '@/utils/type-guards/isNonEmptyString';

import { EditableCell } from '../EditableCell';
import { HoverableMenuItem } from '../HoverableMenuItem';

import { EditableRelationCreateButton } from './EditableRelationCreateButton';

const StyledEditModeContainer = styled.div`
  width: 200px;
`;

const StyledEditModeSelectedContainer = styled.div`
  align-items: center;
  display: flex;
  height: 31px;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(1)};
`;

const StyledEditModeSearchContainer = styled.div`
  align-items: center;
  border-top: 1px solid ${(props) => props.theme.primaryBorder};
  display: flex;
  height: 32px;
  padding-left: ${(props) => props.theme.spacing(1)};
  padding-right: ${(props) => props.theme.spacing(1)};
`;

const StyledEditModeCreateButtonContainer = styled.div`
  align-items: center;
  border-top: 1px solid ${(props) => props.theme.primaryBorder};
  color: ${(props) => props.theme.text60};
  display: flex;
  height: 36px;
  padding: ${(props) => props.theme.spacing(1)};
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

type StyledEditModeResultItemProps = {
  isSelected: boolean;
};

const StyledEditModeResultItem = styled.div<StyledEditModeResultItemProps>`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 32px;
  user-select: none;
  ${(props) =>
    props.isSelected &&
    `
  background-color: ${props.theme.tertiaryBackground};
`}
`;

const StyledCreateButtonIcon = styled.div`
  align-self: center;
  color: ${(props) => props.theme.text100};
  padding-top: 4px;
`;

const StyledCreateButtonText = styled.div`
  color: ${(props) => props.theme.text60};
`;

export type EditableRelationProps<RelationType, ChipComponentPropsType> = {
  relation?: any;
  searchPlaceholder: string;
  searchConfig: SearchConfigType;
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
export function EditableRelation<RelationType, ChipComponentPropsType>({
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
    useSearch<RelationType>({});

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

  const [selectedIndex, setSelectedIndex] = useState(0);
  useHotkeys(
    'down',
    () => {
      setSelectedIndex((prevSelectedIndex) =>
        Math.min(
          prevSelectedIndex + 1,
          (filterSearchResults.results?.length ?? 0) - 1,
        ),
      );
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [setSelectedIndex, filterSearchResults.results],
  );

  useHotkeys(
    'up',
    () => {
      setSelectedIndex((prevSelectedIndex) =>
        Math.max(prevSelectedIndex - 1, 0),
      );
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [setSelectedIndex],
  );

  useHotkeys(
    'enter',
    () => {
      if (isEditMode) {
        if (
          filterSearchResults.results &&
          selectedIndex < filterSearchResults.results.length
        ) {
          const selectedResult = filterSearchResults.results[selectedIndex];
          onChange(selectedResult.value);
          closeEditMode();
        } else if (canCreate && isNonEmptyString(searchInput)) {
          onCreate(searchInput);
          closeEditMode();
        }
      }
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [
      filterSearchResults.results,
      selectedIndex,
      onChange,
      closeEditMode,
      canCreate,
      searchInput,
      onCreate,
    ],
  );

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
                      <IconPlus />
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
                    isSelected={index === selectedIndex}
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
