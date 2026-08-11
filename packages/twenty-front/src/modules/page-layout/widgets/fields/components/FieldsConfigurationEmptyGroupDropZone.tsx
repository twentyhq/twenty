import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { FIELDS_CONFIGURATION_FIELD_DND_TYPE } from '@/page-layout/widgets/fields/constants/FieldsConfigurationFieldDndType';
import { type FieldsConfigurationFieldListEndDropData } from '@/page-layout/widgets/fields/types/FieldsConfigurationFieldListEndDropData';

const StyledEmptyGroupDropZone = styled.div<{ isDropTarget: boolean }>`
  align-items: center;
  border: 1px dashed
    ${({ isDropTarget }) =>
      isDropTarget
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  justify-content: center;
  margin: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[10]};
`;

type FieldsConfigurationEmptyGroupDropZoneProps = {
  groupId: string;
  children: ReactNode;
};

export const FieldsConfigurationEmptyGroupDropZone = ({
  groupId,
  children,
}: FieldsConfigurationEmptyGroupDropZoneProps) => {
  const emptyGroupDropData: FieldsConfigurationFieldListEndDropData = {
    droppableId: groupId,
  };

  const { ref, isDropTarget } = useDroppable({
    id: `fields-configuration-group-${groupId}-empty`,
    accept: FIELDS_CONFIGURATION_FIELD_DND_TYPE,
    collisionDetector: pointerIntersection,
    data: emptyGroupDropData,
  });

  return (
    <StyledEmptyGroupDropZone ref={ref} isDropTarget={isDropTarget}>
      {children}
    </StyledEmptyGroupDropZone>
  );
};
