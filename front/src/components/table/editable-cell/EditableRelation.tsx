import { ComponentType, useState } from 'react';
import EditableCellWrapper from './EditableCellWrapper';

export type EditableRelationProps<RelationType, ChipComponentPropsType> = {
  relation: RelationType;
  changeHandler: (relation: RelationType) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  ChipComponent: ComponentType<ChipComponentPropsType>;
  chipComponentPropsMapper: (
    relation: RelationType,
  ) => ChipComponentPropsType & JSX.IntrinsicAttributes;
};

function EditableRelation<RelationType, ChipComponentPropsType>({
  relation,
  changeHandler,
  editModeHorizontalAlign,
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
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <div>
          {selectedRelation ? (
            <ChipComponent {...chipComponentPropsMapper(selectedRelation)} />
          ) : (
            <></>
          )}
        </div>
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
