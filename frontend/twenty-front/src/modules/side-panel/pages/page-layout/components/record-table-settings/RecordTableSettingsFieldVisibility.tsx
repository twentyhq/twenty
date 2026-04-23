import { useRecordTableWidgetViewFieldItems } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewFieldItems';
import { useReorderRecordTableWidgetFields } from '@/page-layout/widgets/record-table/hooks/useReorderRecordTableWidgetFields';
import { useToggleRecordTableWidgetFieldVisibility } from '@/page-layout/widgets/record-table/hooks/useToggleRecordTableWidgetFieldVisibility';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { type DropResult } from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { useMemo } from 'react';
import { IconEye, IconEyeOff, useIcons } from 'twenty-ui/display';
import { MenuItemDraggable } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFieldListContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
`;

const StyledSectionLabel = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  text-transform: uppercase;
`;

type RecordTableSettingsFieldVisibilityProps = {
  viewId: string;
};

export const RecordTableSettingsFieldVisibility = ({
  viewId,
}: RecordTableSettingsFieldVisibilityProps) => {
  const { recordTableWidgetViewFieldItems } =
    useRecordTableWidgetViewFieldItems(viewId);

  const { toggleRecordTableWidgetFieldVisibility } =
    useToggleRecordTableWidgetFieldVisibility();

  const { reorderRecordTableWidgetFields } =
    useReorderRecordTableWidgetFields();

  const { getIcon } = useIcons();

  const visibleFieldItems = useMemo(
    () =>
      recordTableWidgetViewFieldItems.filter(
        (item) => item.viewField.isVisible,
      ),
    [recordTableWidgetViewFieldItems],
  );

  const hiddenFieldItems = useMemo(
    () =>
      recordTableWidgetViewFieldItems.filter(
        (item) => !item.viewField.isVisible,
      ),
    [recordTableWidgetViewFieldItems],
  );

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    reorderRecordTableWidgetFields(
      source.index,
      destination.index,
      visibleFieldItems,
    );
  };

  return (
    <StyledFieldListContainer>
      <StyledSectionLabel>Visible</StyledSectionLabel>
      {visibleFieldItems.length > 0 && (
        <DraggableList
          onDragEnd={handleDragEnd}
          draggableItems={
            <>
              {visibleFieldItems.map((fieldItem, index) => (
                <DraggableItem
                  key={fieldItem.viewField.id}
                  draggableId={fieldItem.viewField.id}
                  index={index}
                  itemComponent={
                    <MenuItemDraggable
                      LeftIcon={getIcon(fieldItem.fieldMetadataItem.icon)}
                      iconButtons={[
                        {
                          Icon: IconEyeOff,
                          onClick: () => {
                            toggleRecordTableWidgetFieldVisibility(
                              fieldItem.viewField.id,
                              false,
                            );
                          },
                        },
                      ]}
                      text={fieldItem.fieldMetadataItem.label}
                      gripMode="always"
                    />
                  }
                />
              ))}
            </>
          }
        />
      )}
      {hiddenFieldItems.length > 0 && (
        <>
          <StyledSectionLabel>Hidden</StyledSectionLabel>
          {hiddenFieldItems.map((fieldItem) => (
            <MenuItemDraggable
              key={fieldItem.viewField.id}
              LeftIcon={getIcon(fieldItem.fieldMetadataItem.icon)}
              iconButtons={[
                {
                  Icon: IconEye,
                  onClick: () => {
                    toggleRecordTableWidgetFieldVisibility(
                      fieldItem.viewField.id,
                      true,
                    );
                  },
                },
              ]}
              text={fieldItem.fieldMetadataItem.label}
              accent="placeholder"
              isDragDisabled
            />
          ))}
        </>
      )}
    </StyledFieldListContainer>
  );
};
