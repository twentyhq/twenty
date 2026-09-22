import { DraggableListItem } from '@/ui/layout/draggable-list/components/DraggableListItem';
import { t } from '@lingui/core/macro';
import { LightIconButton } from 'twenty-ui/components';
import { useRecordTableWidgetViewFieldItems } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewFieldItems';
import { useReorderRecordTableWidgetFields } from '@/page-layout/widgets/record-table/hooks/useReorderRecordTableWidgetFields';
import { useToggleRecordTableWidgetFieldVisibility } from '@/page-layout/widgets/record-table/hooks/useToggleRecordTableWidgetFieldVisibility';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { styled } from '@linaria/react';
import { useMemo } from 'react';
import { IconEye, IconEyeOff, useIcons } from 'twenty-ui/icon';
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
  widgetId: string;
  pageLayoutId: string;
};

export const RecordTableSettingsFieldVisibility = ({
  viewId,
  widgetId,
  pageLayoutId,
}: RecordTableSettingsFieldVisibilityProps) => {
  const { recordTableWidgetViewFieldItems } =
    useRecordTableWidgetViewFieldItems({ viewId, widgetId, pageLayoutId });

  const { toggleRecordTableWidgetFieldVisibility } =
    useToggleRecordTableWidgetFieldVisibility({ pageLayoutId, widgetId });

  const { reorderRecordTableWidgetFields } = useReorderRecordTableWidgetFields({
    pageLayoutId,
    widgetId,
  });

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

  const handleDragEnd = (result: DraggableListDropResult) => {
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
                    <DraggableListItem
                      actions={
                        <LightIconButton
                          aria-label={t`Hide field`}
                          onClick={() => {
                            toggleRecordTableWidgetFieldVisibility(
                              fieldItem.viewField.id,
                              false,
                            );
                          }}
                        >
                          <IconEyeOff />
                        </LightIconButton>
                      }
                      grip="always"
                      icon={getIcon(fieldItem.fieldMetadataItem.icon)}
                    >
                      {fieldItem.fieldMetadataItem.label}
                    </DraggableListItem>
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
            <DraggableListItem
              key={fieldItem.viewField.id}
              actions={
                <LightIconButton
                  aria-label={t`Show field`}
                  onClick={() => {
                    toggleRecordTableWidgetFieldVisibility(
                      fieldItem.viewField.id,
                      true,
                    );
                  }}
                >
                  <IconEye />
                </LightIconButton>
              }
              placeholder
              dragDisabled
              icon={getIcon(fieldItem.fieldMetadataItem.icon)}
            >
              {fieldItem.fieldMetadataItem.label}
            </DraggableListItem>
          ))}
        </>
      )}
    </StyledFieldListContainer>
  );
};
