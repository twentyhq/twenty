import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/navigation';
import { Tag } from 'twenty-ui/components';

const StyledMenuItem = styled(MenuItem)`
  width: calc(100% - 2 * var(--horizontal-padding));
`;

type RecordIndexPageKanbanAddMenuItemProps = {
  columnId: string;
  onItemClick: (columnDefinition: any) => void;
};

export const RecordIndexPageKanbanAddMenuItem = ({
  columnId,
  onItemClick,
}: RecordIndexPageKanbanAddMenuItemProps) => {
  const recordGroupDefinition = useAtomFamilyStateValue(
    recordGroupDefinitionFamilyState,
    columnId,
  );

  if (!isDefined(recordGroupDefinition)) {
    return null;
  }

  return (
    <StyledMenuItem
      text={
        <Tag
          variant={
            recordGroupDefinition.type === RecordGroupDefinitionType.Value
              ? 'solid'
              : 'outline'
          }
          color={
            recordGroupDefinition.type === RecordGroupDefinitionType.Value
              ? recordGroupDefinition.color
              : 'transparent'
          }
          text={recordGroupDefinition.title}
          weight={
            recordGroupDefinition.type === RecordGroupDefinitionType.Value
              ? 'regular'
              : 'medium'
          }
        />
      }
      onClick={() => onItemClick(recordGroupDefinition)}
    />
  );
};
