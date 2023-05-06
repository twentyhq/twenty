import styled from '@emotion/styled';
import { ComponentType, useState } from 'react';
import EditableCellWrapper from './EditableCellWrapper';

export type EditableRelationProps<RelationType, ChipComponentPropsType> = {
  relation: RelationType;
  changeHandler: (relation: RelationType) => void;
  shouldAlignRight?: boolean;
  ChipComponent: ComponentType<ChipComponentPropsType>;
  chipComponentPropsMapper: (
    relation: RelationType,
  ) => ChipComponentPropsType & JSX.IntrinsicAttributes;
};

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
`;
function EditableRelation<RelationType, ChipComponentPropsType>({
  relation,
  changeHandler,
  shouldAlignRight,
  ChipComponent,
  chipComponentPropsMapper,
}: EditableRelationProps<RelationType, ChipComponentPropsType>) {
  const [selectedRelation, setSelectedRelation] = useState(relation);
  const [searchResults, setSearchResults] = useState([]);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const onEditModeChange = (isEditMode: boolean) => {
    setIsEditMode(isEditMode);
  };

  return (
    <EditableCellWrapper
      onEditModeChange={onEditModeChange}
      shouldAlignRight={shouldAlignRight}
    >
      <StyledContainer>
        {isEditMode ? (
          <div></div>
        ) : (
          <div>
            {selectedRelation ? (
              <ChipComponent {...chipComponentPropsMapper(selectedRelation)} />
            ) : (
              <></>
            )}
          </div>
        )}
      </StyledContainer>
    </EditableCellWrapper>
  );
}

export default EditableRelation;
